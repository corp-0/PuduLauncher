using System.Diagnostics;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class TtsInstallService(
    IHttpClientFactory httpClientFactory,
    IEventPublisher eventPublisher,
    ILogger<TtsInstallService> logger) : ITtsInstallService, IDisposable
{
    private const string InstallerExeName = "HonkTTS.Installer";
    private const string InstallerLogPrefix = "[HonkTTS.Installer]";
    private readonly object _processLock = new();
    private Process? _currentInstallerProcess;

    public async Task DownloadInstallerAsync(string downloadUrl, string zipPath, CancellationToken ct = default)
    {
        logger.LogInformation("Downloading TTS installer from {Url}", downloadUrl);

        using var client = httpClientFactory.CreateClient();
        await using var responseStream = await client.GetStreamAsync(downloadUrl, ct);
        await using var fileStream = File.Create(zipPath);
        await responseStream.CopyToAsync(fileStream, ct);

        logger.LogInformation("TTS installer downloaded to {Path}", zipPath);
    }

    public async Task RunInstallerAsync(string extractDir, string installPath, CancellationToken ct = default)
    {
        string installerExe = FindInstallerExecutable(extractDir);

        var psi = new ProcessStartInfo
        {
            FileName = installerExe,
            Arguments = $"\"{installPath}\"",
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        using var process = new Process { StartInfo = psi, EnableRaisingEvents = true };
        process.Start();

        lock (_processLock)
        {
            _currentInstallerProcess = process;
        }

        logger.LogInformation("Running TTS installer (PID {Pid}): {Exe} \"{InstallPath}\"",
            process.Id, installerExe, installPath);

        using var cancellationRegistration = ct.Register(() =>
            TryKillProcessTree(process, logger, "Installer cancellation requested."));

        var stdoutTask = Task.Run(async () =>
        {
            while (await process.StandardOutput.ReadLineAsync(ct) is { } line)
            {
                logger.LogInformation("{Prefix} {Line}", InstallerLogPrefix, line);
                await eventPublisher.PublishAsync(new TtsInstallOutputEvent { Line = line }, ct);
            }
        }, ct);

        var stderrTask = Task.Run(async () =>
        {
            while (await process.StandardError.ReadLineAsync(ct) is { } line)
            {
                logger.LogWarning("{Prefix} {Line}", InstallerLogPrefix, line);
                await eventPublisher.PublishAsync(new TtsInstallOutputEvent { Line = line }, ct);
            }
        }, ct);

        try
        {
            await process.WaitForExitAsync(ct);
            await Task.WhenAll(stdoutTask, stderrTask);
        }
        catch (OperationCanceledException)
        {
            TryKillProcessTree(process, logger, "Installer cancelled.");
            throw;
        }
        finally
        {
            lock (_processLock)
            {
                if (ReferenceEquals(_currentInstallerProcess, process))
                {
                    _currentInstallerProcess = null;
                }
            }
        }

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException(
                $"TTS installer exited with code {process.ExitCode}");
        }
    }

    public void Dispose()
    {
        lock (_processLock)
        {
            if (_currentInstallerProcess is not null)
            {
                TryKillProcessTree(_currentInstallerProcess, logger, "Service disposing while installer still running.");
                _currentInstallerProcess = null;
            }
        }
    }

    private static void TryKillProcessTree(Process process, ILogger logger, string reason)
    {
        try
        {
            if (process.HasExited)
            {
                return;
            }

            logger.LogWarning("{Reason} Killing installer process tree (PID {Pid}).", reason, process.Id);
            process.Kill(entireProcessTree: true);
        }
        catch (InvalidOperationException)
        {
            // Process already exited.
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to kill installer process tree.");
        }
    }

    private static string FindInstallerExecutable(string extractDir)
    {
        string exeName = OperatingSystem.IsWindows()
            ? $"{InstallerExeName}.exe"
            : InstallerExeName;

        string exePath = Path.Combine(extractDir, exeName);

        if (!File.Exists(exePath))
        {
            throw new FileNotFoundException(
                $"Installer executable not found at {exePath}");
        }

        if (!OperatingSystem.IsWindows())
        {
            File.SetUnixFileMode(exePath,
                UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute);
        }

        return exePath;
    }
}
