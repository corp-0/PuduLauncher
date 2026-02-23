using DiscordRPC;
using PuduLauncher.Constants;
using PuduLauncher.Models.Game;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class DiscordPresenceService(
    IServerListService serverListService,
    IPreferencesService preferencesService,
    ILogger<DiscordPresenceService> logger) : IDiscordPresenceService
{
    private const int DefaultServerTrackingIntervalMs = 10_000;

    private static readonly string[] LauncherDetailsVariants =
    [
        "Perusing the launcher...",
        "Browsing available servers...",
        "Checking what's live right now...",
        "Getting ready for the next round...",
        "Looking for a place to drop in...",
        "Choosing where to play next...",
        "Scanning the station network...",
        "Setting things up before launch...",
        "Singlehandely breaking the curse...",
        "Navigating the multiverse..."
    ];

    private static readonly string[] AssetKeys = ["14", "20", "25"];

    private readonly Lock _lock = new();
    private DiscordRpcClient? _client;
    private DateTime? _activeGameSessionStartedAtUtc;
    private CancellationTokenSource? _serverTrackingCts;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        if (!IsEnabled()) return Task.CompletedTask;

        if (string.IsNullOrWhiteSpace(Discord.ApplicationId))
        {
            logger.LogInformation("Discord rich presence disabled because Discord.ApplicationId is empty");
            return Task.CompletedTask;
        }

        TryConnect();
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        Disconnect();
        return Task.CompletedTask;
    }

    public void SetLauncherState()
    {
        EnsureClientMatchesPreference();

        StopServerTracking();
        lock (_lock)
        {
            _activeGameSessionStartedAtUtc = null;
        }

        SetPresenceSafe(
            details: GetRandomLauncherDetails(),
            state: "In launcher",
            largeImageText: null,
            randomizeLargeImage: false,
            includeTimestamp: false);
    }

    public void SetInServerState(ServerPresenceInfo info)
    {
        EnsureClientMatchesPreference();

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

    public void SetInBuildState(BuildPresenceInfo info)
    {
        EnsureClientMatchesPreference();

        string resolvedState = BuildInServerState(info.ForkName);
        string resolvedDetails = BuildInBuildDetails(info.BuildVersion);

        SetPresenceSafe(
            details: resolvedDetails,
            state: resolvedState,
            largeImageText: null,
            randomizeLargeImage: true,
            includeTimestamp: true);
    }

    public void StartGameSession(GameSessionPresenceInfo info)
    {
        EnsureClientMatchesPreference();

        StopServerTracking();
        lock (_lock)
        {
            _activeGameSessionStartedAtUtc = DateTime.UtcNow;
        }

        if (string.IsNullOrWhiteSpace(info.ServerIp))
        {
            SetInBuildState(new BuildPresenceInfo(info.ForkName, info.BuildVersion));
            return;
        }

        GameSessionPresenceInfo normalizedSessionInfo = info with { ServerIp = info.ServerIp.Trim() };

        var cts = new CancellationTokenSource();
        lock (_lock)
        {
            _serverTrackingCts = cts;
        }

        _ = Task.Run(() => TrackServerPresenceAsync(normalizedSessionInfo, cts.Token), cts.Token);
    }

    private bool IsEnabled() => preferencesService.GetPreferences().Launcher.EnableDiscordRichPresence;

    private void EnsureClientMatchesPreference()
    {
        if (string.IsNullOrWhiteSpace(Discord.ApplicationId)) return;

        bool enabled = IsEnabled();
        bool connected;
        lock (_lock)
        {
            connected = _client != null;
        }

        if (enabled && !connected)
        {
            TryConnect();
        }
        else if (!enabled && connected)
        {
            Disconnect();
        }
    }

    private void TryConnect()
    {
        try
        {
            var client = new DiscordRpcClient(Discord.ApplicationId, -1, new DebugOnlyDiscordLogger(logger));

            if (!client.Initialize())
            {
                logger.LogInformation("Discord rich presence unavailable. Discord may not be running");
                client.Dispose();
                return;
            }

            lock (_lock)
            {
                _client = client;
            }

            SetPresenceSafe(
                details: GetRandomLauncherDetails(),
                state: "In launcher",
                largeImageText: null,
                randomizeLargeImage: false,
                includeTimestamp: false);

            logger.LogInformation("Discord rich presence initialized");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to initialize Discord rich presence");
        }
    }

    private void Disconnect()
    {
        StopServerTracking();
        lock (_lock)
        {
            _activeGameSessionStartedAtUtc = null;
        }

        DiscordRpcClient? client;
        lock (_lock)
        {
            client = _client;
            _client = null;
        }

        if (client == null) return;

        try
        {
            if (client.IsInitialized)
            {
                client.ClearPresence();
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Failed while clearing Discord rich presence during disconnect");
        }
        finally
        {
            client.Dispose();
        }

        logger.LogInformation("Discord rich presence disconnected");
    }

    private void SetPresenceSafe(string details, string state, string? largeImageText, bool randomizeLargeImage, bool includeTimestamp)
    {
        DiscordRpcClient? client;
        lock (_lock)
        {
            client = _client;
        }

        if (client is not { IsInitialized: true }) return;

        try
        {
            DateTime? sessionStartedAtUtc = includeTimestamp ? GetOrCreateGameSessionStartTimestamp() : null;
            var presence = new RichPresence
            {
                Details = details,
                State = state,
                Timestamps = sessionStartedAtUtc.HasValue ? new Timestamps(sessionStartedAtUtc.Value) : null
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
            logger.LogDebug(ex, "Failed to set Discord rich presence state");
        }
    }

    private async Task TrackServerPresenceAsync(GameSessionPresenceInfo sessionInfo, CancellationToken ct)
    {
        try
        {
            GameServer? initialServer = await ResolveInitialServerAsync(sessionInfo.ServerIp!, sessionInfo.ServerPort, ct);
            if (initialServer == null)
            {
                SetInBuildState(new BuildPresenceInfo(sessionInfo.ForkName, sessionInfo.BuildVersion));
                return;
            }

            ct.ThrowIfCancellationRequested();
            ApplyServerPresence(initialServer, sessionInfo);

            while (!ct.IsCancellationRequested)
            {
                int delayMs = ResolveServerTrackingIntervalMs();
                await Task.Delay(delayMs, ct);

                GameServer? server = await TryFindServerAsync(sessionInfo.ServerIp!, sessionInfo.ServerPort, ct);
                if (server == null)
                {
                    continue;
                }

                ct.ThrowIfCancellationRequested();
                ApplyServerPresence(server, sessionInfo);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
#pragma warning disable CA1873
            logger.LogDebug(
                ex,
                "Failed while tracking server presence for Discord ({ServerIp}:{ServerPort})",
                sessionInfo.ServerIp,
                sessionInfo.ServerPort);
            SetInBuildState(new BuildPresenceInfo(sessionInfo.ForkName, sessionInfo.BuildVersion));
#pragma warning restore CA1873
        }
    }

    private async Task<GameServer?> ResolveInitialServerAsync(string serverIp, int? serverPort, CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                return await serverListService.FindServerAsync(serverIp, serverPort, ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogDebug(
                    ex,
                    "Failed initial server lookup for Discord presence tracking ({ServerIp}:{ServerPort}). Retrying",
                    serverIp,
                    serverPort);

                int delayMs = ResolveServerTrackingIntervalMs();
                await Task.Delay(delayMs, ct);
            }
        }

        return null;
    }

    private async Task<GameServer?> TryFindServerAsync(string serverIp, int? serverPort, CancellationToken ct)
    {
        try
        {
            return await serverListService.FindServerAsync(serverIp, serverPort, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogDebug(
                ex,
                "Failed to query server list for Discord presence tracking ({ServerIp}:{ServerPort})",
                serverIp,
                serverPort);
            return null;
        }
    }

    private void ApplyServerPresence(GameServer server, GameSessionPresenceInfo sessionInfo)
    {
        string? resolvedForkName = string.IsNullOrWhiteSpace(server.ForkName)
            ? sessionInfo.ForkName
            : server.ForkName;

        int? resolvedServerPort = server.ServerPort > 0
            ? server.ServerPort
            : sessionInfo.ServerPort;

        SetInServerState(new ServerPresenceInfo(
            resolvedForkName,
            server.ServerName,
            server.GameMode,
            server.CurrentMap,
            server.ServerIp,
            resolvedServerPort));
    }

    private int ResolveServerTrackingIntervalMs()
    {
        try
        {
            int intervalSeconds = preferencesService.GetPreferences().Servers.ServerListFetchIntervalSeconds;
            return Math.Max(1, intervalSeconds) * 1000;
        }
        catch (Exception ex)
        {
            logger.LogDebug(
                ex,
                "Failed to read server tracking interval for Discord presence. Using default {DefaultServerTrackingIntervalMs}ms",
                DefaultServerTrackingIntervalMs);
            return DefaultServerTrackingIntervalMs;
        }
    }

    private void StopServerTracking()
    {
        CancellationTokenSource? cts;
        lock (_lock)
        {
            cts = _serverTrackingCts;
            _serverTrackingCts = null;
        }

        if (cts == null)
        {
            return;
        }

        try
        {
            cts.Cancel();
        }
        catch (ObjectDisposedException)
        {
        }
    }

    private DateTime GetOrCreateGameSessionStartTimestamp()
    {
        lock (_lock)
        {
            if (!_activeGameSessionStartedAtUtc.HasValue)
            {
                _activeGameSessionStartedAtUtc = DateTime.UtcNow;
            }

            return _activeGameSessionStartedAtUtc.Value;
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
            return $"In {serverName.Trim()}";
        }

        if (!string.IsNullOrWhiteSpace(serverIp))
        {
            return serverPort.HasValue ? $"In {serverIp}:{serverPort.Value}" : $"In {serverIp}";
        }

        return "In unknown server";
    }

    private static string BuildInBuildDetails(int? buildVersion)
    {
        return buildVersion.HasValue ? $"Build {buildVersion.Value}" : "Build unknown";
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

    /// <summary>
    /// Wraps a Microsoft.Extensions.Logging.ILogger to route all Discord RPC library
    /// logs to Debug level, preventing noisy connection-retry spam in the terminal.
    /// </summary>
    private sealed class DebugOnlyDiscordLogger(Microsoft.Extensions.Logging.ILogger msLogger) : DiscordRPC.Logging.ILogger
    {
        public DiscordRPC.Logging.LogLevel Level { get; set; } = DiscordRPC.Logging.LogLevel.Trace;

        public void Trace(string message, params object[] args) =>
            msLogger.LogDebug("[DiscordRPC:Trace] {Message}", SafeFormat(message, args));

        public void Info(string message, params object[] args) =>
            msLogger.LogDebug("[DiscordRPC:Info] {Message}", SafeFormat(message, args));

        public void Warning(string message, params object[] args) =>
            msLogger.LogDebug("[DiscordRPC:Warn] {Message}", SafeFormat(message, args));

        public void Error(string message, params object[] args) =>
            msLogger.LogDebug("[DiscordRPC:Error] {Message}", SafeFormat(message, args));

        private static string SafeFormat(string message, object[] args)
        {
            try { return args.Length > 0 ? string.Format(message, args) : message; }
            catch { return message; }
        }
    }
}
