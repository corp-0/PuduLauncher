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

    private Process? _serverProcess;

    public bool IsRunning => _serverProcess is { HasExited: false };

    public Task StartAsync(string installPath, CancellationToken ct = default)
    {
        if (IsRunning)
        {
            logger.LogInformation("TTS server already running");
            return Task.CompletedTask;
        }

        string scriptName = OperatingSystem.IsWindows() ? "start_tts.bat" : "start_tts.sh";
        string scriptPath = Path.Combine(installPath, scriptName);

        if (!File.Exists(scriptPath))
        {
            throw new FileNotFoundException($"Start script not found: {scriptPath}");
        }

        var psi = CreateProcessStartInfo(scriptPath);
        var process = new Process { StartInfo = psi, EnableRaisingEvents = true };

        process.Exited += (_, _) =>
        {
            logger.LogInformation("TTS server process exited with code {Code}", process.ExitCode);
        };

        process.Start();
        _serverProcess = process;
        logger.LogInformation("TTS server process started (PID {Pid})", process.Id);

        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken ct = default)
    {
        if (_serverProcess is null or { HasExited: true })
        {
            _serverProcess?.Dispose();
            _serverProcess = null;
            return;
        }

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
            };
        }

        return new ProcessStartInfo
        {
            FileName = "/bin/bash",
            Arguments = $"\"{scriptPath}\"",
            CreateNoWindow = true,
            UseShellExecute = false,
        };
    }
}
