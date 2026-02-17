using System.IO.Compression;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Tts;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class TtsService : ITtsService, IDisposable
{
    private readonly ITtsVersionService _versionService;
    private readonly ITtsInstallService _installService;
    private readonly ITtsServerService _serverService;
    private readonly IPreferencesService _preferencesService;
    private readonly IEventPublisher _eventPublisher;
    private readonly IErrorDisplayServer _errorDisplayServer;
    private readonly ILogger<TtsService> _logger;

    private readonly SemaphoreSlim _operationLock = new(1, 1);

    private TtsStatus _status = TtsStatus.NotInstalled;
    private TtsManifest? _manifest;
    private string? _latestVersion;
    private string? _errorMessage;

    public TtsService(
        ITtsVersionService versionService,
        ITtsInstallService installService,
        ITtsServerService serverService,
        IPreferencesService preferencesService,
        IEventPublisher eventPublisher,
        IErrorDisplayServer errorDisplayServer,
        ILogger<TtsService> logger)
    {
        _versionService = versionService;
        _installService = installService;
        _serverService = serverService;
        _preferencesService = preferencesService;
        _eventPublisher = eventPublisher;
        _errorDisplayServer = errorDisplayServer;
        _logger = logger;

        var prefs = _preferencesService.GetPreferences();
        _manifest = _versionService.LoadManifest(prefs.Tts.InstallPath);

        if (_manifest != null)
        {
            _status = TtsStatus.Installed;
        }

        if (prefs.Tts.Enabled && prefs.Tts.AutoStartOnLaunch && _status == TtsStatus.Installed)
        {
            _ = Task.Run(() => StartServerAsync());
        }
    }

    public TtsState GetState()
    {
        var prefs = _preferencesService.GetPreferences();
        return new TtsState
        {
            Status = _status,
            InstalledVersion = _manifest?.InstallerVersion,
            LatestVersion = _latestVersion,
            UpdateAvailable = _latestVersion != null
                              && _manifest != null
                              && _latestVersion != _manifest.InstallerVersion,
            InstallPath = prefs.Tts.InstallPath,
            ErrorMessage = _errorMessage
        };
    }

    public async Task CheckForUpdatesAsync(CancellationToken ct = default)
    {
        await SetStatusAsync(TtsStatus.CheckingForUpdates);

        try
        {
            var release = await _versionService.FetchLatestReleaseAsync(ct);
            _latestVersion = release.TagName;
            _logger.LogInformation("Latest TTS version: {Version}, installed: {Installed}",
                _latestVersion, _manifest?.InstallerVersion ?? "none");

            await SetStatusAsync(_manifest != null ? TtsStatus.Installed : TtsStatus.NotInstalled);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check for TTS updates");
            await SetStatusAsync(_manifest != null ? TtsStatus.Installed : TtsStatus.NotInstalled);
            throw;
        }
    }

    public async Task InstallAsync(CancellationToken ct = default)
    {
        if (!await _operationLock.WaitAsync(0, ct))
        {
            _logger.LogWarning("TTS install already in progress");
            return;
        }

        try
        {
            var prefs = _preferencesService.GetPreferences();
            string installPath = prefs.Tts.InstallPath;

            if (_serverService.IsRunning)
            {
                await _serverService.StopAsync(ct);
            }

            // Fetch latest release
            await SetStatusAsync(TtsStatus.CheckingForUpdates);
            var release = await _versionService.FetchLatestReleaseAsync(ct);
            _latestVersion = release.TagName;

            string assetName = _versionService.GetPlatformAssetName();
            var asset = release.Assets.FirstOrDefault(a =>
                a.Name.Equals(assetName, StringComparison.OrdinalIgnoreCase))
                ?? throw new InvalidOperationException(
                    $"No asset '{assetName}' found in release {release.TagName}");

            // Download
            await SetStatusAsync(TtsStatus.Downloading);
            string tempDir = Path.Combine(Path.GetTempPath(), $"pudu-tts-{Guid.NewGuid():N}");
            Directory.CreateDirectory(tempDir);

            try
            {
                string zipPath = Path.Combine(tempDir, "tts-installer.zip");
                await _installService.DownloadInstallerAsync(asset.BrowserDownloadUrl, zipPath, ct);

                // Extract and run installer
                string extractDir = Path.Combine(tempDir, "extracted");
                ZipFile.ExtractToDirectory(zipPath, extractDir);

                await SetStatusAsync(TtsStatus.Installing);
                await _installService.RunInstallerAsync(extractDir, installPath, ct);

                // Reload manifest
                _manifest = _versionService.LoadManifest(installPath);

                if (_manifest != null)
                {
                    await SetStatusAsync(TtsStatus.Installed, "Installation complete");
                }
                else
                {
                    throw new InvalidOperationException("Installation completed but manifest not found");
                }
            }
            finally
            {
                try { Directory.Delete(tempDir, recursive: true); }
                catch (Exception ex) { _logger.LogWarning(ex, "Failed to clean up temp dir: {Path}", tempDir); }
            }
        }
        catch (OperationCanceledException)
        {
            await SetStatusAsync(TtsStatus.NotInstalled, "Installation cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TTS installation failed");
            await SetStatusAsync(TtsStatus.Error, ex.Message);
            await _errorDisplayServer.ShowExceptionAsync(ex, "TTS", "TTS installation failed");
        }
        finally
        {
            _operationLock.Release();
        }
    }

    public async Task UninstallAsync(CancellationToken ct = default)
    {
        if (!await _operationLock.WaitAsync(0, ct))
        {
            _logger.LogWarning("TTS operation already in progress");
            return;
        }

        try
        {
            if (_serverService.IsRunning)
            {
                await _serverService.StopAsync(ct);
            }

            var prefs = _preferencesService.GetPreferences();

            if (Directory.Exists(prefs.Tts.InstallPath))
            {
                Directory.Delete(prefs.Tts.InstallPath, recursive: true);
                _logger.LogInformation("Deleted TTS installation at {Path}", prefs.Tts.InstallPath);
            }

            _manifest = null;
            _latestVersion = null;
            await SetStatusAsync(TtsStatus.NotInstalled, "TTS uninstalled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TTS uninstall failed");
            await SetStatusAsync(TtsStatus.Error, ex.Message);
            await _errorDisplayServer.ShowExceptionAsync(ex, "TTS", "TTS uninstall failed");
        }
        finally
        {
            _operationLock.Release();
        }
    }

    public async Task StartServerAsync(CancellationToken ct = default)
    {
        if (!await _operationLock.WaitAsync(0, ct))
        {
            _logger.LogWarning("TTS operation already in progress");
            return;
        }

        try
        {
            if (_manifest is null)
            {
                throw new InvalidOperationException("TTS is not installed");
            }

            var prefs = _preferencesService.GetPreferences();

            await SetStatusAsync(TtsStatus.ServerStarting, "Starting TTS server...");
            await _serverService.StartAsync(prefs.Tts.InstallPath, ct);
            await _serverService.WaitForHealthAsync(ct);
            await SetStatusAsync(TtsStatus.ServerRunning, "TTS server is running");
        }
        catch (OperationCanceledException)
        {
            await SetStatusAsync(TtsStatus.Installed, "Server start cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start TTS server");
            await SetStatusAsync(TtsStatus.Error, ex.Message);
            await _errorDisplayServer.ShowExceptionAsync(ex, "TTS", "Failed to start TTS server");
        }
        finally
        {
            _operationLock.Release();
        }
    }

    public async Task StopServerAsync(CancellationToken ct = default)
    {
        if (!await _operationLock.WaitAsync(0, ct))
        {
            _logger.LogWarning("TTS operation already in progress");
            return;
        }

        try
        {
            await _serverService.StopAsync(ct);
            await SetStatusAsync(TtsStatus.ServerStopped, "TTS server stopped");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to stop TTS server");
            await SetStatusAsync(TtsStatus.Error, ex.Message);
        }
        finally
        {
            _operationLock.Release();
        }
    }

    private async Task SetStatusAsync(TtsStatus status, string? message = null)
    {
        _status = status;
        _errorMessage = status == TtsStatus.Error ? message : null;

        await _eventPublisher.PublishAsync(new TtsStatusChangedEvent
        {
            Status = status,
            Message = message
        });
    }

    public void Dispose()
    {
        _serverService.Dispose();
        _operationLock.Dispose();
    }
}
