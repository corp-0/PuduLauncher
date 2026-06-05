namespace PuduLauncher.Services.Interfaces;

/// <summary>
/// Abstraction over waiting for an external process (by PID) to exit.
/// Exists so the host watchdog can be unit-tested without a real process.
/// </summary>
public interface IProcessExitWatcher
{
    /// <summary>
    /// Completes when the process with the given id has exited, or returns
    /// immediately if no such process exists. Honors cancellation.
    /// </summary>
    Task WaitForProcessExitAsync(int processId, CancellationToken cancellationToken);
}
