using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

/// <summary>
/// Watches the launcher (host) process. If the host exits without signaling a
/// graceful shutdown (e.g. it crashed), this triggers host shutdown so the TTS
/// cleanup in TtsShutdownHostedService runs. Inert when no --host-pid is given.
/// </summary>
public class HostWatchdogHostedService(
    IConfiguration configuration,
    IProcessExitWatcher watcher,
    IHostApplicationLifetime lifetime,
    ILogger<HostWatchdogHostedService> logger) : IHostedService
{
    private CancellationTokenSource? _cts;
    private Task? _watchTask;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        string? hostPidRaw = configuration["host-pid"];
        if (!int.TryParse(hostPidRaw, out int hostPid))
        {
            logger.LogInformation("Host watchdog inert: no valid --host-pid provided");
            return Task.CompletedTask;
        }

        _cts = new CancellationTokenSource();
        _watchTask = WatchAsync(hostPid, _cts.Token);
        logger.LogInformation("Host watchdog started for PID {Pid}", hostPid);
        return Task.CompletedTask;
    }

    private async Task WatchAsync(int hostPid, CancellationToken ct)
    {
        try
        {
            await watcher.WaitForProcessExitAsync(hostPid, ct);
            if (!ct.IsCancellationRequested)
            {
                logger.LogInformation("Host process {Pid} exited; shutting down sidecar", hostPid);
                lifetime.StopApplication();
            }
        }
        catch (OperationCanceledException)
        {
            // Watchdog cancelled during normal shutdown.
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Host watchdog failed");
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _cts?.Cancel();
        if (_watchTask is not null)
        {
            try { await _watchTask; }
            catch { /* already logged */ }
        }
        _cts?.Dispose();
    }
}
