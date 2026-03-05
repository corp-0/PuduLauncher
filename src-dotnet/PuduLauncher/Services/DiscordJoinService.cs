using System.Text.Json;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Discord;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class DiscordJoinService(
    IServerListService serverListService,
    IInstallationService installationService,
    IInstallationWorkflowService installationWorkflowService,
    IGameLaunchService gameLaunchService,
    IDownloadService downloadService,
    IEventPublisher eventPublisher,
    IDiscordPresenceService discordPresenceService,
    IHostApplicationLifetime hostApplicationLifetime,
    ILogger<DiscordJoinService> logger) : IDiscordJoinService
{
    private static readonly TimeSpan MaxWaitForInstall = TimeSpan.FromMinutes(30);

    public void SubscribeToJoinEvents()
    {
        discordPresenceService.JoinSecretReceived += secret =>
            _ = Task.Run(() => HandleJoinSecretAsync(secret));
    }

    public async Task HandleJoinSecretAsync(string secret)
    {
        try
        {
            DiscordJoinSecret? joinInfo = ParseJoinSecret(secret);
            if (joinInfo == null)
            {
                logger.LogWarning("Failed to parse Discord join secret: {Secret}", secret);
                return;
            }

            logger.LogInformation(
                "Discord join received: {Ip}:{Port} fork={Fork} build={Build}",
                joinInfo.Ip, joinInfo.Port, joinInfo.Fork, joinInfo.Build);

            GameServer? server = await serverListService.FindServerAsync(joinInfo.Ip, joinInfo.Port);
            if (server == null)
            {
                logger.LogWarning("Server not found in server list for Discord join: {Ip}:{Port}", joinInfo.Ip, joinInfo.Port);
                await eventPublisher.PublishAsync(new DiscordJoinRequestEvent
                {
                    ServerIp = joinInfo.Ip,
                    ServerPort = joinInfo.Port,
                    ForkName = joinInfo.Fork,
                    BuildVersion = joinInfo.Build,
                    Status = DiscordJoinStatus.ServerNotFound
                });
                return;
            }

            await ResolveAndJoinAsync(server, joinInfo.Ip, joinInfo.Port, joinInfo.Fork, joinInfo.Build);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to handle Discord join");
        }
    }

    public async Task AcceptJoinAsync(AcceptDiscordJoinRequest request)
    {
        GameServer? server = await serverListService.FindServerAsync(request.ServerIp, request.ServerPort);
        if (server == null)
        {
            throw new InvalidOperationException(
                $"Server {request.ServerIp}:{request.ServerPort} not found in server list");
        }

        string forkName = server.ForkName
                          ?? throw new InvalidOperationException("Server has no fork name");
        int buildVersion = server.BuildVersion;

        Installation? installation = installationService.GetInstallation(forkName, buildVersion);
        if (installation != null)
        {
            await gameLaunchService.LaunchGameAsync(installation.Id, server.ServerIp, server.ServerPort);
            return;
        }

        await installationWorkflowService.StartServerDownloadAsync(server);

        logger.LogInformation(
            "Discord join: download started for {ForkName} v{BuildVersion}, will auto-launch when complete",
            forkName, buildVersion);

        _ = Task.Run(() => WaitForInstallAndLaunchAsync(
            forkName, buildVersion, server.ServerIp!, server.ServerPort,
            hostApplicationLifetime.ApplicationStopping));
    }

    private async Task ResolveAndJoinAsync(
        GameServer server, string fallbackIp, int fallbackPort, string fallbackFork, int fallbackBuild)
    {
        string forkName = server.ForkName ?? fallbackFork;
        int buildVersion = server.BuildVersion > 0 ? server.BuildVersion : fallbackBuild;

        Installation? installation = installationService.GetInstallation(forkName, buildVersion);
        if (installation != null)
        {
            logger.LogInformation("Build already installed, launching game for Discord join");
            await gameLaunchService.LaunchGameAsync(
                installation.Id, server.ServerIp, server.ServerPort);
            return;
        }

        logger.LogInformation("Build not installed, prompting user for Discord join");
        await eventPublisher.PublishAsync(new DiscordJoinRequestEvent
        {
            ServerIp = server.ServerIp ?? fallbackIp,
            ServerPort = server.ServerPort > 0 ? server.ServerPort : fallbackPort,
            ServerName = server.ServerName,
            ForkName = forkName,
            BuildVersion = buildVersion,
            GameMode = server.GameMode,
            CurrentMap = server.CurrentMap,
            PlayerCount = server.PlayerCount,
            PlayerCountMax = server.PlayerCountMax,
            Status = DiscordJoinStatus.InstallRequired
        });
    }

    private async Task WaitForInstallAndLaunchAsync(
        string forkName, int buildVersion, string serverIp, int serverPort,
        CancellationToken cancellationToken)
    {
        try
        {
            DateTime deadline = DateTime.UtcNow + MaxWaitForInstall;

            while (DateTime.UtcNow < deadline)
            {
                await Task.Delay(2000, cancellationToken);

                Installation? installation = installationService.GetInstallation(forkName, buildVersion);
                if (installation != null)
                {
                    logger.LogInformation(
                        "Discord join: build installed, launching {ForkName} v{BuildVersion}",
                        forkName, buildVersion);

                    await gameLaunchService.LaunchGameAsync(installation.Id, serverIp, serverPort);
                    return;
                }

                Download? download = downloadService.GetDownload(forkName, buildVersion);
                if (download == null || download.State is DownloadState.Failed or DownloadState.ScanFailed)
                {
                    logger.LogWarning(
                        "Discord join: download failed or cancelled for {ForkName} v{BuildVersion}",
                        forkName, buildVersion);
                    return;
                }
            }

            logger.LogWarning(
                "Discord join: timed out waiting for install of {ForkName} v{BuildVersion}",
                forkName, buildVersion);
        }
        catch (OperationCanceledException)
        {
            logger.LogInformation(
                "Discord join: cancelled waiting for install of {ForkName} v{BuildVersion}",
                forkName, buildVersion);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex,
                "Discord join: failed waiting for install to complete for {ForkName} v{BuildVersion}",
                forkName, buildVersion);
        }
    }

    private static DiscordJoinSecret? ParseJoinSecret(string secret)
    {
        try
        {
            return JsonSerializer.Deserialize(secret, JsonCtx.Default.DiscordJoinSecret);
        }
        catch
        {
            return null;
        }
    }
}
