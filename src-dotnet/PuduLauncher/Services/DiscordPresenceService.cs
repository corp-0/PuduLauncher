using DiscordRPC;
using PuduLauncher.Constants;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class DiscordPresenceService(ILogger<DiscordPresenceService> logger) : IDiscordPresenceService
{
    private static readonly string[] LauncherDetailsVariants =
    [
        "Perusing the launcher...",
        "Browsing available servers...",
        "Checking what's live right now...",
        "Getting ready for the next round...",
        "Looking for a place to drop in...",
        "Reviewing their checklist before launch...",
        "Choosing where to play next...",
        "Scanning the station network...",
        "Setting things up before launch...",
        "Singlehandely breaking the curse...",
        "Navigating the multiverse..."
    ];

    private static readonly string[] AssetKeys = ["14", "20", "25"];

    private readonly Lock _lock = new();
    private DiscordRpcClient? _client;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(Discord.ApplicationId))
        {
            logger.LogInformation(
                "Discord rich presence disabled because Discord.ApplicationId is empty.");
            return Task.CompletedTask;
        }

        try
        {
            var client = new DiscordRpcClient(Discord.ApplicationId, logger);

            if (!client.Initialize())
            {
                logger.LogInformation("Discord rich presence unavailable. Discord may not be running.");
                client.Dispose();
                return Task.CompletedTask;
            }

            lock (_lock)
            {
                _client = client;
            }

            SetLauncherState();
            logger.LogInformation("Discord rich presence initialized.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to initialize Discord rich presence.");
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        DiscordRpcClient? client;
        lock (_lock)
        {
            client = _client;
            _client = null;
        }

        if (client == null) return Task.CompletedTask;

        try
        {
            if (client.IsInitialized)
            {
                client.ClearPresence();
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Failed while clearing Discord rich presence during shutdown.");
        }
        finally
        {
            client.Dispose();
        }

        return Task.CompletedTask;
    }

    public void SetLauncherState()
    {
        SetPresenceSafe(
            details: GetRandomLauncherDetails(),
            state: "In launcher",
            largeImageText: null,
            randomizeLargeImage: false,
            includeTimestamp: false);
    }

    public void SetInServerState(ServerPresenceInfo info)
    {
        string resolvedState = BuildInServerState(info.ForkName);
        string resolvedDetails = BuildInServerDetails(info.ServerName, info.ServerIp, info.ServerPort);
        string resolvedLargeImageText = BuildLargeImageText(info.GameMode, info.CurrentMap);

        SetPresenceSafe(
            details: resolvedDetails,
            state: resolvedState,
            largeImageText: resolvedLargeImageText,
            randomizeLargeImage: true,
            includeTimestamp: true);
    }

    private void SetPresenceSafe(string details, string state, string? largeImageText, bool randomizeLargeImage, bool includeTimestamp)
    {
        DiscordRpcClient? client;
        lock (_lock)
        {
            client = _client;
        }

        if (client == null || !client.IsInitialized) return;

        try
        {
            var presence = new RichPresence
            {
                Details = details,
                State = state,
                Timestamps = includeTimestamp ? Timestamps.Now : null
            };

            if (randomizeLargeImage || !string.IsNullOrWhiteSpace(largeImageText))
            {
                presence.Assets = new Assets
                {
                    LargeImageKey = randomizeLargeImage ? GetRandomAssetKey() : null,
                    LargeImageText = largeImageText
                };
            }

            client.SetPresence(presence);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Failed to set Discord rich presence state.");
        }
    }

    private static string BuildInServerState(string? forkName)
    {
        return $"Playing {NormalizeForkName(forkName)}";
    }

    private static string BuildInServerDetails(string? serverName, string? serverIp, int? serverPort)
    {
        if (!string.IsNullOrWhiteSpace(serverName))
        {
            return $"At {serverName.Trim()}";
        }

        if (!string.IsNullOrWhiteSpace(serverIp))
        {
            return serverPort.HasValue ? $"At {serverIp}:{serverPort.Value}" : $"At {serverIp}";
        }

        return "At unknown server";
    }

    private static string BuildLargeImageText(string? gameMode, string? currentMap)
    {
        string mode = string.IsNullOrWhiteSpace(gameMode) ? "Unknown mode" : gameMode.Trim();
        string map = CleanMapName(currentMap);
        return $"{mode} in {map}";
    }

    private static string NormalizeForkName(string? forkName)
    {
        return string.IsNullOrWhiteSpace(forkName) ? "Unitystation" : forkName.Trim();
    }

    private static string CleanMapName(string? currentMap)
    {
        string rawMap = currentMap?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(rawMap))
        {
            return "Unknown map";
        }

        if (rawMap.StartsWith("MainStations/", StringComparison.Ordinal))
        {
            rawMap = rawMap["MainStations/".Length..];
        }

        if (rawMap.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            rawMap = rawMap[..^".json".Length];
        }

        return rawMap;
    }

    private static string GetRandomAssetKey()
    {
        return AssetKeys[Random.Shared.Next(AssetKeys.Length)];
    }

    private static string GetRandomLauncherDetails()
    {
        return LauncherDetailsVariants[Random.Shared.Next(LauncherDetailsVariants.Length)];
    }
}
