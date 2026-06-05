using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class HostWatchdogHostedServiceTests
{
    [Fact]
    public async Task WhenHostPidExits_RequestsApplicationStop()
    {
        var watcher = new ControllableProcessExitWatcher();
        var lifetime = new RecordingHostApplicationLifetime();
        var service = CreateService(hostPid: "4242", watcher, lifetime);

        await service.StartAsync(CancellationToken.None);
        watcher.SignalExit();

        var completed = await Task.WhenAny(lifetime.StopRequested, Task.Delay(TimeSpan.FromSeconds(5)));
        Assert.Equal(lifetime.StopRequested, completed);
        Assert.True(lifetime.StopApplicationCalled);
        Assert.Equal(4242, watcher.WatchedPid);

        await service.StopAsync(CancellationToken.None);
    }

    [Fact]
    public async Task WhenNoHostPid_IsInert()
    {
        var watcher = new ControllableProcessExitWatcher();
        var lifetime = new RecordingHostApplicationLifetime();
        var service = CreateService(hostPid: null, watcher, lifetime);

        await service.StartAsync(CancellationToken.None);
        await service.StopAsync(CancellationToken.None);

        Assert.False(watcher.WaitCalled);
        Assert.False(lifetime.StopApplicationCalled);
    }

    private static HostWatchdogHostedService CreateService(
        string? hostPid, IProcessExitWatcher watcher, RecordingHostApplicationLifetime lifetime)
    {
        var settings = new Dictionary<string, string?>();
        if (hostPid is not null) settings["host-pid"] = hostPid;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();

        return new HostWatchdogHostedService(
            configuration, watcher, lifetime, NullLogger<HostWatchdogHostedService>.Instance);
    }

    private sealed class ControllableProcessExitWatcher : IProcessExitWatcher
    {
        private readonly TaskCompletionSource _exit =
            new(TaskCreationOptions.RunContinuationsAsynchronously);

        public bool WaitCalled { get; private set; }
        public int WatchedPid { get; private set; }

        public void SignalExit() => _exit.TrySetResult();

        public async Task WaitForProcessExitAsync(int processId, CancellationToken cancellationToken)
        {
            WaitCalled = true;
            WatchedPid = processId;
            await using (cancellationToken.Register(() => _exit.TrySetCanceled()))
            {
                await _exit.Task;
            }
        }
    }
}
