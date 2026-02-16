using System.Collections.Concurrent;
using System.Diagnostics;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class GameLaunchService(
    IInstallationService installationService,
    IEnvironmentService environmentService,
    IEventPublisher eventPublisher,
    IDiscordPresenceService discordPresenceService,
    ILogger<GameLaunchService> logger) : IGameLaunchService
{
    private readonly ConcurrentDictionary<string, Process> _runningGames = new();

    public async Task LaunchGameAsync(
        Guid installationId,
        string? serverIp = null,
        int? serverPort = null)
    {
        var installation = installationService.GetInstallationById(installationId)
            ?? throw new InvalidOperationException($"Installation not found: {installationId}");

        string gameKey = $"{installation.ForkName}:{installation.BuildVersion}:{serverIp}:{serverPort}";

        try
        {
            string executable = FindExecutable(installation.InstallationPath)
                ?? throw new InvalidOperationException(
                    $"Could not find executable in: {installation.InstallationPath}");

            EnsureExecutablePermissions(executable);

            string arguments = BuildArguments(serverIp, serverPort);
            ProcessStartInfo? startInfo = environmentService.GetGameProcessStartInfo(executable, arguments);

            if (startInfo == null)
            {
                throw new InvalidOperationException(
                    $"Unsupported platform: {environmentService.GetCurrentEnvironment()}");
            }

            startInfo.UseShellExecute = false;

            var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };

            var eventServerIp = serverIp ?? string.Empty;
            var eventServerPort = serverPort ?? 0;

            process.Exited += async (_, _) =>
            {
                _runningGames.TryRemove(gameKey, out _);
                process.Dispose();

                logger.LogInformation("Game exited: {GameKey}", gameKey);
                if (_runningGames.IsEmpty)
                {
                    discordPresenceService.SetLauncherState();
                }

                await eventPublisher.PublishAsync(new GameStateChangedEvent
                {
                    ServerIp = eventServerIp,
                    ServerPort = eventServerPort,
                    IsRunning = false,
                });
            };

            bool started;
            try
            {
                started = process.Start();
            }
            catch
            {
                process.Dispose();
                throw;
            }

            if (!started)
            {
                process.Dispose();
                throw new InvalidOperationException($"Game process failed to start for executable: {executable}");
            }

            _runningGames.TryAdd(gameKey, process);
            discordPresenceService.StartGameSession(new GameSessionPresenceInfo(
                installation.ForkName,
                installation.BuildVersion,
                serverIp,
                serverPort));

            logger.LogInformation(
                "Launched game: Fork={ForkName} Version={BuildVersion} Server={ServerIp}:{ServerPort}",
                installation.ForkName, installation.BuildVersion, serverIp, serverPort);

            await eventPublisher.PublishAsync(new GameStateChangedEvent
            {
                ServerIp = eventServerIp,
                ServerPort = eventServerPort,
                IsRunning = true,
            });

            await installationService.MarkAsPlayedAsync(installationId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Failed to launch game: InstallationId={InstallationId} Fork={ForkName} Version={BuildVersion} Path={Path} Server={ServerIp}:{ServerPort}",
                installationId, installation.ForkName, installation.BuildVersion, installation.InstallationPath, serverIp, serverPort);
            throw;
        }
    }

    public bool IsGameRunning(string forkName, int buildVersion)
    {
        return _runningGames.ContainsKey($"{forkName}:{buildVersion}");
    }

    private string? FindExecutable(string? installPath)
    {
        if (string.IsNullOrWhiteSpace(installPath) || !Directory.Exists(installPath))
        {
            return null;
        }

        string? executable = environmentService.GetCurrentEnvironment() switch
        {
            CurrentEnvironment.WindowsStandalone
                => Path.Combine(installPath, "Unitystation.exe"),
            CurrentEnvironment.MacOsStandalone
                => Path.Combine(installPath, "Unitystation.app", "Contents", "MacOS", "unitystation"),
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak
                => Path.Combine(installPath, "Unitystation"),
            _ => null
        };

        return !string.IsNullOrWhiteSpace(executable) && File.Exists(executable)
            ? executable
            : null;
    }

    private void EnsureExecutablePermissions(string executablePath)
    {
        if (environmentService.GetCurrentEnvironment() == CurrentEnvironment.WindowsStandalone)
        {
            return;
        }

        try
        {
            var process = Process.Start("chmod", $"+x \"{executablePath}\"");
            process?.WaitForExit(5000);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to set executable permissions on {Path}", executablePath);
        }
    }

    private static string BuildArguments(string? serverIp, int? serverPort)
    {
        if (string.IsNullOrWhiteSpace(serverIp)) return string.Empty;

        return serverPort.HasValue
            ? $"--server {serverIp} --port {serverPort.Value}"
            : $"--server {serverIp}";
    }
}
