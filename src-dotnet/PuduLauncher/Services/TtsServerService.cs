using System.Diagnostics;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class TtsServerService(
    IHttpClientFactory httpClientFactory,
    ILogger<TtsServerService> logger) : ITtsServerService
{
    private const int HealthPollIntervalMs = 2000;
    private const int HealthPollTimeoutMs = 120_000;
    private const int ShutdownGraceMs = 5000;
    private const string honkLogPrefix = "[HonkTTS]";

    private Process? _serverProcess;
    private string? _lastInstallPath;

    public bool IsRunning => _serverProcess is { HasExited: false };

    public Task StartAsync(string installPath, CancellationToken ct = default)
    {
        if (IsRunning)
        {
            logger.LogInformation("TTS server already running");
            return Task.CompletedTask;
        }

        _lastInstallPath = installPath;
        string scriptName = OperatingSystem.IsWindows() ? "start_tts.bat" : "start_tts.sh";
        string scriptPath = Path.Combine(installPath, scriptName);

        if (!File.Exists(scriptPath))
        {
            throw new FileNotFoundException($"Start script not found: {scriptPath}");
        }

        var psi = CreateProcessStartInfo(scriptPath);
        var process = new Process { StartInfo = psi, EnableRaisingEvents = true };

        process.OutputDataReceived += (_, eventArgs) =>
        {
            if (!string.IsNullOrWhiteSpace(eventArgs.Data))
            {
                logger.LogInformation("{Prefix} {Line}", honkLogPrefix, eventArgs.Data);
            }
        };

        process.ErrorDataReceived += (_, eventArgs) =>
        {
            if (!string.IsNullOrWhiteSpace(eventArgs.Data))
            {
                logger.LogWarning("{Prefix} {Line}", honkLogPrefix, eventArgs.Data);
            }
        };

        process.Exited += (_, _) =>
        {
            logger.LogInformation("TTS server process exited with code {Code}", process.ExitCode);
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        _serverProcess = process;
        logger.LogInformation("TTS server process started (PID {Pid})", process.Id);

        return Task.CompletedTask;
    }

    public async Task StopAsync(string? installPath = null, CancellationToken ct = default)
    {
        string? effectiveInstallPath = string.IsNullOrWhiteSpace(installPath) ? _lastInstallPath : installPath;
        int orphanedProcessCount = 0;

        if (_serverProcess is null or { HasExited: true })
        {
            _serverProcess?.Dispose();
            _serverProcess = null;
        }
        else
        {
            logger.LogInformation("Stopping TTS server (PID {Pid})", _serverProcess.Id);

            try
            {
                _serverProcess.Kill(entireProcessTree: true);
                await _serverProcess.WaitForExitAsync(
                    new CancellationTokenSource(ShutdownGraceMs).Token);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Error stopping TTS server process");
            }
            finally
            {
                _serverProcess.Dispose();
                _serverProcess = null;
            }
        }

        if (!string.IsNullOrWhiteSpace(effectiveInstallPath))
        {
            orphanedProcessCount = KillProcessesUnderPath(effectiveInstallPath);
        }

        if (orphanedProcessCount > 0)
        {
            logger.LogInformation("Stopped {Count} lingering HonkTTS process(es) from {Path}",
                orphanedProcessCount, effectiveInstallPath);
        }
    }

    public async Task WaitForHealthAsync(CancellationToken ct = default)
    {
        using var client = httpClientFactory.CreateClient();
        var deadline = Stopwatch.StartNew();

        while (deadline.ElapsedMilliseconds < HealthPollTimeoutMs)
        {
            ct.ThrowIfCancellationRequested();

            try
            {
                var response = await client.GetAsync("http://127.0.0.1:5234/health", ct);
                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation("TTS server health check passed");
                    return;
                }
            }
            catch (HttpRequestException)
            {
                // Server not ready yet
            }

            await Task.Delay(HealthPollIntervalMs, ct);
        }

        throw new TimeoutException(
            $"TTS server did not become healthy within {HealthPollTimeoutMs / 1000}s");
    }

    public void Dispose()
    {
        if (_serverProcess is { HasExited: false })
        {
            try { _serverProcess.Kill(entireProcessTree: true); }
            catch (Exception ex) { logger.LogWarning(ex, "Error killing TTS server on dispose"); }
        }

        _serverProcess?.Dispose();
    }

    private static ProcessStartInfo CreateProcessStartInfo(string scriptPath)
    {
        if (OperatingSystem.IsWindows())
        {
            return new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c \"{scriptPath}\"",
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
            };
        }

        return new ProcessStartInfo
        {
            FileName = "/bin/bash",
            Arguments = $"\"{scriptPath}\"",
            CreateNoWindow = true,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };
    }

    private int KillProcessesUnderPath(string installPath)
    {
        string normalizedInstallPath;

        try
        {
            normalizedInstallPath = NormalizePath(installPath);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to normalize TTS install path for process cleanup: {Path}", installPath);
            return 0;
        }

        int killed = 0;
        var processes = Process.GetProcesses();

        foreach (var process in processes)
        {
            try
            {
                if (process.Id == Environment.ProcessId || process.HasExited)
                {
                    continue;
                }

                string? executablePath = TryGetExecutablePath(process);
                if (string.IsNullOrWhiteSpace(executablePath) || !PathStartsWithRoot(executablePath, normalizedInstallPath))
                {
                    continue;
                }

                logger.LogInformation("Stopping lingering HonkTTS process {ProcessName} (PID {Pid}) from {Path}",
                    process.ProcessName, process.Id, executablePath);
                process.Kill(entireProcessTree: true);
                process.WaitForExit(ShutdownGraceMs);
                killed++;
            }
            catch (InvalidOperationException)
            {
                // Process already exited.
            }
            catch (Exception ex)
            {
                logger.LogDebug(ex, "Failed to stop lingering process while cleaning HonkTTS install path");
            }
            finally
            {
                process.Dispose();
            }
        }

        return killed;
    }

    private static string? TryGetExecutablePath(Process process)
    {
        try
        {
            return process.MainModule?.FileName;
        }
        catch
        {
            return null;
        }
    }

    private static bool PathStartsWithRoot(string path, string normalizedRoot)
    {
        string normalizedPath;
        try
        {
            normalizedPath = NormalizePath(path);
        }
        catch
        {
            return false;
        }

        var comparison = OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;

        if (string.Equals(normalizedPath, normalizedRoot, comparison))
        {
            return true;
        }

        return normalizedPath.StartsWith($"{normalizedRoot}{Path.DirectorySeparatorChar}", comparison)
               || normalizedPath.StartsWith($"{normalizedRoot}{Path.AltDirectorySeparatorChar}", comparison);
    }

    private static string NormalizePath(string path)
    {
        return Path.GetFullPath(path).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
    }
}
