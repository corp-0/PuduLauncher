using PuduLauncher.Services;

namespace PuduLauncher.Tests.Services;

public class ProcessExitWatcherTests
{
    [Fact]
    public async Task WaitForProcessExitAsync_WhenPidDoesNotExist_ReturnsImmediately()
    {
        var watcher = new ProcessExitWatcher();

        // PID very unlikely to exist; method should return without throwing.
        var task = watcher.WaitForProcessExitAsync(int.MaxValue - 1, CancellationToken.None);
        var completed = await Task.WhenAny(task, Task.Delay(TimeSpan.FromSeconds(5)));

        Assert.Equal(task, completed);
        await task;
    }
}
