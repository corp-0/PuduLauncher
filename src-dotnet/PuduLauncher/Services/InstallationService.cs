using System.Text.Json;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class InstallationService : IInstallationService
{
    private readonly string _installationsFilePath;
    private readonly IPreferencesService _preferencesService;
    private readonly IEnvironmentService _environmentService;
    private readonly IEventPublisher _eventPublisher;
    private readonly IErrorDisplayServer _errorDisplayServer;
    private readonly ILogger<InstallationService> _logger;
    private List<Installation> _installations;

    public InstallationService(
        IPreferencesService preferencesService,
        IEnvironmentService environmentService,
        IEventPublisher eventPublisher,
        IErrorDisplayServer errorDisplayServer,
        ILogger<InstallationService> logger)
    {
        _preferencesService = preferencesService;
        _environmentService = environmentService;
        _eventPublisher = eventPublisher;
        _errorDisplayServer = errorDisplayServer;
        _logger = logger;

        _installationsFilePath = Path.Combine(
            _environmentService.GetUserdataDirectory(), "installations.json");

        _installations = ReadInstallations();
        ReconcileStaleInstallations();

        EnsureInstallationBasePath();

        _logger.LogInformation(
            "InstallationService initialized with {Count} installations from {Path}",
            _installations.Count, _installationsFilePath);
    }

    public List<Installation> GetInstallations() => _installations;

    public Installation? GetInstallation(string forkName, int buildVersion)
    {
        return _installations.FirstOrDefault(i =>
            i.ForkName == forkName && i.BuildVersion == buildVersion);
    }

    public Installation? GetInstallationById(Guid id)
    {
        return _installations.FirstOrDefault(i => i.Id == id);
    }

    public async Task AddInstallationAsync(Installation installation)
    {
        _installations.Add(installation);
        WriteInstallations();

        _logger.LogInformation(
            "Added installation: Fork={ForkName} Version={BuildVersion} Path={Path}",
            installation.ForkName, installation.BuildVersion, installation.InstallationPath);

        await PublishInstallationsChangedAsync();
        await CleanupOldVersionsAsync();
    }

    public async Task DeleteInstallationAsync(Guid id)
    {
        Installation? installation = GetInstallationById(id);
        if (installation == null)
        {
            _logger.LogWarning("Cannot delete installation: not found. ID={Id}", id);
            return;
        }

        if (!string.IsNullOrWhiteSpace(installation.InstallationPath)
            && Directory.Exists(installation.InstallationPath))
        {
            _logger.LogInformation(
                "Deleting installation files: Fork={ForkName} Version={BuildVersion} Path={Path}",
                installation.ForkName, installation.BuildVersion, installation.InstallationPath);

            DeleteDirectory(installation.InstallationPath);
        }

        _installations.Remove(installation);
        WriteInstallations();
        await PublishInstallationsChangedAsync();
    }

    public async Task CleanupOldVersionsAsync()
    {
        var prefs = _preferencesService.GetPreferences();
        if (!prefs.Installations.AutoRemove)
        {
            _logger.LogInformation("Auto-remove is disabled, skipping cleanup");
            return;
        }

        var toDelete = _installations
            .GroupBy(i => i.ForkName, StringComparer.OrdinalIgnoreCase)
            .SelectMany(group => group
                .OrderByDescending(i => i.BuildVersion)
                .ThenByDescending(i => i.LastPlayedDate)
                .Skip(1))
            .ToList();

        if (toDelete.Count == 0)
        {
            _logger.LogInformation("No old installations to clean up");
            return;
        }

        _logger.LogInformation("Cleaning up {Count} old installations", toDelete.Count);

        foreach (var installation in toDelete)
        {
            if (!string.IsNullOrWhiteSpace(installation.InstallationPath)
                && Directory.Exists(installation.InstallationPath))
            {
                DeleteDirectory(installation.InstallationPath);
            }

            _installations.Remove(installation);
        }

        WriteInstallations();
        await PublishInstallationsChangedAsync();
    }

    public async Task MoveInstallationsAsync(string newBasePath)
    {
        EnsureDirectoryExists(newBasePath);

        string oldBasePath = _preferencesService.GetPreferences().Installations.InstallationPath;
        string normalizedOldBase = Path.GetFullPath(oldBasePath);
        string normalizedNewBase = Path.GetFullPath(newBasePath);

        _logger.LogInformation(
            "Moving installations from {OldBasePath} to {NewBasePath} ({Count} total installations)",
            normalizedOldBase, normalizedNewBase, _installations.Count);

        var toMove = _installations
            .Where(i => Path.GetFullPath(i.InstallationPath)
                .StartsWith(normalizedOldBase, StringComparison.OrdinalIgnoreCase))
            .ToList();

        _logger.LogInformation("{MatchCount} installations matched for move", toMove.Count);

        foreach (var installation in toMove)
        {
            string normalizedInstallPath = Path.GetFullPath(installation.InstallationPath);
            string relativePath = normalizedInstallPath[normalizedOldBase.Length..].TrimStart(Path.DirectorySeparatorChar);
            string newPath = Path.Combine(normalizedNewBase, relativePath);

            if (!Directory.Exists(normalizedInstallPath))
            {
                _logger.LogWarning("Source directory does not exist, skipping: {Path}", normalizedInstallPath);
                continue;
            }

            if (Directory.Exists(newPath))
            {
                _logger.LogWarning("Target directory already exists, skipping: {Path}", newPath);
                continue;
            }

            string? parentDir = Path.GetDirectoryName(newPath);
            if (parentDir != null)
            {
                Directory.CreateDirectory(parentDir);
            }

            Directory.Move(normalizedInstallPath, newPath);
            installation.InstallationPath = newPath;

            _logger.LogInformation("Moved installation from {Old} to {New}", normalizedInstallPath, newPath);
        }

        var prefs = _preferencesService.GetPreferences();
        prefs.Installations.InstallationPath = normalizedNewBase;
        await _preferencesService.UpdatePreferencesAsync(prefs);

        WriteInstallations();
        await PublishInstallationsChangedAsync();
    }

    public bool IsValidInstallationBasePath(string path)
    {
        if (!path.All(char.IsAscii))
        {
            _logger.LogWarning("Path contains non-ASCII characters: {Path}", path);
            return false;
        }

        try
        {
            if (Directory.Exists(path))
            {
                string testFilePath = Path.Combine(path, $"PuduLauncherWriteTest-{Guid.NewGuid()}");
                File.WriteAllText(testFilePath, "write access test");
                File.Delete(testFilePath);
            }
            else
            {
                Directory.CreateDirectory(path);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Path is not writable: {Path}", path);
            return false;
        }

        return true;
    }

    public async Task MarkAsPlayedAsync(Guid id)
    {
        Installation? installation = GetInstallationById(id);
        if (installation == null) return;

        installation.LastPlayedDate = DateTime.UtcNow;
        WriteInstallations();
        await PublishInstallationsChangedAsync();
    }

    // ── Private helpers ─────────────────────────────────

    private List<Installation> ReadInstallations()
    {
        if (!File.Exists(_installationsFilePath))
        {
            return [];
        }

        try
        {
            string json = File.ReadAllText(_installationsFilePath);
            if (string.IsNullOrWhiteSpace(json)) return [];

            var list = JsonSerializer.Deserialize(json, JsonCtx.Default.InstallationList);
            return list?.Installations ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read installations from {Path}", _installationsFilePath);
            _ = _errorDisplayServer.ShowExceptionAsync(
                ex,
                source: "installation-service.read-installations",
                userMessage: "Failed to read installations from disk. The installation list may be incomplete.",
                code: "INSTALLATIONS_READ_FAILED",
                isTransient: false);
            return [];
        }
    }

    private void WriteInstallations()
    {
        try
        {
            var list = new InstallationList { Installations = _installations };
            string json = JsonSerializer.Serialize(list, JsonCtx.Default.InstallationList);
            File.WriteAllText(_installationsFilePath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write installations to {Path}", _installationsFilePath);
            _ = _errorDisplayServer.ShowExceptionAsync(
                ex,
                source: "installation-service.write-installations",
                userMessage: "Failed to save installations to disk.",
                code: "INSTALLATIONS_WRITE_FAILED",
                isTransient: false);
        }
    }

    private void DeleteDirectory(string path)
    {
        try
        {
            if (_environmentService.GetCurrentEnvironment() == CurrentEnvironment.WindowsStandalone)
            {
                // Windows: clear read-only attributes before deletion
                foreach (string file in Directory.GetFiles(path, "*", SearchOption.AllDirectories))
                {
                    File.SetAttributes(file, FileAttributes.Normal);
                }
            }

            Directory.Delete(path, recursive: true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete directory: {Path}", path);
            _ = _errorDisplayServer.ShowExceptionAsync(
                ex,
                source: "installation-service.delete-directory",
                userMessage: "Failed to delete installation files from disk.",
                code: "INSTALLATION_DELETE_FAILED",
                isTransient: false);
        }
    }

    private void EnsureInstallationBasePath()
    {
        string basePath = _preferencesService.GetPreferences().Installations.InstallationPath;
        if (!string.IsNullOrWhiteSpace(basePath))
        {
            EnsureDirectoryExists(basePath);
        }
    }

    private static void EnsureDirectoryExists(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    private void ReconcileStaleInstallations()
    {
        int beforeCount = _installations.Count;
        if (beforeCount == 0)
        {
            return;
        }

        _installations = _installations
            .Where(IsInstallationOnDiskValid)
            .ToList();

        int removedCount = beforeCount - _installations.Count;
        if (removedCount == 0)
        {
            return;
        }

        _logger.LogWarning(
            "Detected {RemovedCount} stale installations in {Path}; regenerating file with {RemainingCount} valid entries",
            removedCount, _installationsFilePath, _installations.Count);

        WriteInstallations();
    }

    private bool IsInstallationOnDiskValid(Installation installation)
    {
        if (string.IsNullOrWhiteSpace(installation.InstallationPath)
            || !Directory.Exists(installation.InstallationPath))
        {
            return false;
        }

        string? executablePath = _environmentService.GetCurrentEnvironment() switch
        {
            CurrentEnvironment.WindowsStandalone
                => Path.Combine(installation.InstallationPath, "Unitystation.exe"),
            CurrentEnvironment.MacOsStandalone
                => Path.Combine(installation.InstallationPath, "Unitystation.app", "Contents", "MacOS", "unitystation"),
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak
                => Path.Combine(installation.InstallationPath, "Unitystation"),
            _ => null
        };

        return executablePath == null || File.Exists(executablePath);
    }

    private async Task PublishInstallationsChangedAsync()
    {
        await _eventPublisher.PublishAsync(
            new InstallationsChangedEvent { Installations = _installations });
    }
}
