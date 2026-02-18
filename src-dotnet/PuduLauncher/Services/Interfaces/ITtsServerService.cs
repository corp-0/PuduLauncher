namespace PuduLauncher.Services.Interfaces;

public interface ITtsServerService : IDisposable
{
    bool IsRunning { get; }
    Task StartAsync(string installPath, CancellationToken ct = default);
    Task StopAsync(string? installPath = null, CancellationToken ct = default);
    Task WaitForHealthAsync(CancellationToken ct = default);
}
