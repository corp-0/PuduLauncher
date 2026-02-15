using System.Diagnostics;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class TtsInstallService(
    IHttpClientFactory httpClientFactory,
    IEventPublisher eventPublisher,
    ILogger<TtsInstallService> logger) : ITtsInstallService
{
    private const string InstallerExeName = "HonkTTS.Installer";

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

        logger.LogInformation("Running TTS installer (PID {Pid}): {Exe} \"{InstallPath}\"",
            process.Id, installerExe, installPath);

        var stdoutTask = Task.Run(async () =>
        {
            while (await process.StandardOutput.ReadLineAsync(ct) is { } line)
            {
                logger.LogInformation("[TTS Installer] {Line}", line);
                await eventPublisher.PublishAsync(new TtsInstallOutputEvent { Line = line }, ct);
            }
        }, ct);

        var stderrTask = Task.Run(async () =>
        {
            while (await process.StandardError.ReadLineAsync(ct) is { } line)
            {
                logger.LogWarning("[TTS Installer stderr] {Line}", line);
                await eventPublisher.PublishAsync(new TtsInstallOutputEvent { Line = line }, ct);
            }
        }, ct);

        await process.WaitForExitAsync(ct);
        await Task.WhenAll(stdoutTask, stderrTask);

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException(
                $"TTS installer exited with code {process.ExitCode}");
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
