using Microsoft.Extensions.Hosting;

namespace PuduLauncher.Tests.Infrastructure;

/// <summary>Test double for IHostApplicationLifetime that records StopApplication().</summary>
public sealed class RecordingHostApplicationLifetime : IHostApplicationLifetime
{
    private readonly TaskCompletionSource _stopRequested =
        new(TaskCreationOptions.RunContinuationsAsynchronously);

    public bool StopApplicationCalled { get; private set; }

    /// <summary>Completes the first time StopApplication() is called.</summary>
    public Task StopRequested => _stopRequested.Task;

    public CancellationToken ApplicationStarted => CancellationToken.None;
    public CancellationToken ApplicationStopping => CancellationToken.None;
    public CancellationToken ApplicationStopped => CancellationToken.None;

    public void StopApplication()
    {
        StopApplicationCalled = true;
        _stopRequested.TrySetResult();
    }
}
