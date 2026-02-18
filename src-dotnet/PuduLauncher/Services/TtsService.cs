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
    private readonly CancellationTokenSource _shutdownCts = new();

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
        IHostApplicationLifetime hostApplicationLifetime,
        ILogger<TtsService> logger)
    {
        _versionService = versionService;
        _installService = installService;
        _serverService = serverService;
        _preferencesService = preferencesService;
        _eventPublisher = eventPublisher;
        _errorDisplayServer = errorDisplayServer;
        _logger = logger;
        hostApplicationLifetime.ApplicationStopping.Register(() => _shutdownCts.Cancel());

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
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _shutdownCts.Token);
        CancellationToken operationCt = linkedCts.Token;
        await SetStatusAsync(TtsStatus.CheckingForUpdates);

        try
        {
            var release = await _versionService.FetchLatestReleaseAsync(operationCt);
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
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _shutdownCts.Token);
        CancellationToken operationCt = linkedCts.Token;
        var installCompleted = false;

        if (!await _operationLock.WaitAsync(0, operationCt))
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
                await _serverService.StopAsync(installPath, operationCt);
            }

            // Fetch latest release
            await SetStatusAsync(TtsStatus.CheckingForUpdates);
            var release = await _versionService.FetchLatestReleaseAsync(operationCt);
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
                await _installService.DownloadInstallerAsync(asset.BrowserDownloadUrl, zipPath, operationCt);

                // Extract and run installer
                string extractDir = Path.Combine(tempDir, "extracted");
                ZipFile.ExtractToDirectory(zipPath, extractDir);

                await SetStatusAsync(TtsStatus.Installing);
                await _installService.RunInstallerAsync(extractDir, installPath, operationCt);

                // Reload manifest
                _manifest = _versionService.LoadManifest(installPath);

                if (_manifest != null)
                {
                    installCompleted = true;
                    await SetStatusAsync(TtsStatus.Installed, "Installation complete");

                    if (prefs.Tts.Enabled && prefs.Tts.AutoStartOnLaunch)
                    {
                        await SetStatusAsync(TtsStatus.ServerStarting, "Starting TTS server...");
                        await _serverService.StartAsync(installPath, operationCt);
                        await _serverService.WaitForHealthAsync(operationCt);
                        await SetStatusAsync(TtsStatus.ServerRunning, "TTS server is running");
                    }
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
            await SetStatusAsync(
                installCompleted ? TtsStatus.Installed : TtsStatus.NotInstalled,
                installCompleted ? "Server start cancelled" : "Installation cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, installCompleted
                ? "TTS auto-start failed after installation"
                : "TTS installation failed");
            await SetStatusAsync(TtsStatus.Error, ex.Message);
            await _errorDisplayServer.ShowExceptionAsync(
                ex,
                "TTS",
                installCompleted
                    ? "TTS installation completed but auto-start failed"
                    : "TTS installation failed");
        }
        finally
        {
            _operationLock.Release();
        }
    }

    public async Task UninstallAsync(CancellationToken ct = default)
    {
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _shutdownCts.Token);
        CancellationToken operationCt = linkedCts.Token;

        if (!await _operationLock.WaitAsync(0, operationCt))
        {
            _logger.LogWarning("TTS operation already in progress");
            return;
        }

        try
        {
            var prefs = _preferencesService.GetPreferences();
            await _serverService.StopAsync(prefs.Tts.InstallPath, operationCt);

            if (Directory.Exists(prefs.Tts.InstallPath))
            {
                await DeleteInstallDirectoryWithRetriesAsync(prefs.Tts.InstallPath, operationCt);
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
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _shutdownCts.Token);
        CancellationToken operationCt = linkedCts.Token;

        if (!await _operationLock.WaitAsync(0, operationCt))
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
            await _serverService.StartAsync(prefs.Tts.InstallPath, operationCt);
            await _serverService.WaitForHealthAsync(operationCt);
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
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _shutdownCts.Token);
        CancellationToken operationCt = linkedCts.Token;

        if (!await _operationLock.WaitAsync(0, operationCt))
        {
            _logger.LogWarning("TTS operation already in progress");
            return;
        }

        try
        {
            var prefs = _preferencesService.GetPreferences();
            await _serverService.StopAsync(prefs.Tts.InstallPath, operationCt);
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

    private async Task DeleteInstallDirectoryWithRetriesAsync(string installPath, CancellationToken ct)
    {
        const int maxAttempts = 5;
        const int retryDelayMs = 300;

        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            ct.ThrowIfCancellationRequested();

            try
            {
                Directory.Delete(installPath, recursive: true);
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts &&
                                       (ex is IOException || ex is UnauthorizedAccessException))
            {
                _logger.LogWarning(ex,
                    "Failed to delete TTS install directory on attempt {Attempt}/{MaxAttempts}. Retrying...",
                    attempt, maxAttempts);
                await _serverService.StopAsync(installPath, ct);
                await Task.Delay(retryDelayMs, ct);
            }
        }

        Directory.Delete(installPath, recursive: true);
    }

    public void Dispose()
    {
        _shutdownCts.Cancel();
        _shutdownCts.Dispose();
        _serverService.Dispose();
        _operationLock.Dispose();
    }
}
