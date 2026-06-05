using System.Diagnostics;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class ProcessExitWatcher : IProcessExitWatcher
{
    public async Task WaitForProcessExitAsync(int processId, CancellationToken cancellationToken)
    {
        Process process;
        try
        {
            process = Process.GetProcessById(processId);
        }
        catch (ArgumentException)
        {
            // Process is not running (or already gone).
            return;
        }

        using (process)
        {
            try
            {
                process.EnableRaisingEvents = true;
                await process.WaitForExitAsync(cancellationToken);
            }
            catch (InvalidOperationException)
            {
                // Process exited between GetProcessById and the wait.
            }
        }
    }
}
