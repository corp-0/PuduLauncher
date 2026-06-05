using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

/// <summary>
/// Ensures the TTS server is stopped when the host shuts down gracefully.
/// The generic host awaits IHostedService.StopAsync during shutdown, so this
/// runs the full process-tree kill and path sweep in TtsServerService.StopAsync.
/// </summary>
public class TtsShutdownHostedService(
    ITtsServerService serverService,
    IPreferencesService preferencesService,
    ILogger<TtsShutdownHostedService> logger) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        try
        {
            var prefs = preferencesService.GetPreferences();
            // Pass None: cleanup must complete even though the shutdown token may
            // already be cancelling. StopAsync bounds itself with its own grace timeout.
            await serverService.StopAsync(prefs.Tts.InstallPath, CancellationToken.None);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to stop TTS server during shutdown");
        }
    }
}
