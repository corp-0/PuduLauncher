using System.Text.Json;
using PuduLauncher.Models;
using PuduLauncher.Models.Game;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class ServerListService(
    IHttpClientFactory httpClientFactory,
    IPreferencesService preferences,
    IErrorDisplayServer errorDisplayServer,
    IPingService pingService,
    ILogger<ServerListService> logger) : IServerListService
{

    public async Task<List<GameServer>> FetchServerListAsync(CancellationToken ct = default)
    {
        logger.LogInformation("Fetching server list");
        using HttpClient client = httpClientFactory.CreateClient();
        string data = await client.GetStringAsync(preferences.GetPreferences().Servers.ServerListApi, ct);
        ServerList? serverData = JsonSerializer.Deserialize(data, JsonCtx.Default.ServerList);
        List<GameServer> servers = serverData?.Servers ?? [];
        logger.LogInformation("Fetched server list with {Amount} servers", servers.Count);

        await PopulateServerPingsAsync(servers);

        return servers;
    }

    private async Task PopulateServerPingsAsync(List<GameServer> servers)
    {
        if (servers.Count == 0)
        {
            return;
        }

        var pingFailures = new List<string>();
        var failureLock = new object();

        Task[] pingTasks = servers.Select(async server =>
        {
            if (string.IsNullOrWhiteSpace(server.ServerIp))
            {
                server.PingMs = 0;
                return;
            }

            try
            {
                string pingResult = await pingService.GetPingAsync(server.ServerIp);
                server.PingMs = ParsePingMs(pingResult);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ping failed for server {ServerName} ({ServerIp}:{ServerPort})", server.ServerName, server.ServerIp, server.ServerPort);
                lock (failureLock)
                {
                    pingFailures.Add($"{server.ServerName} ({server.ServerIp}:{server.ServerPort}) -> {ex.Message}");
                }
                server.PingMs = 0;
            }
        }).ToArray();

        await Task.WhenAll(pingTasks);

        if (pingFailures.Count > 0)
        {
            string details = string.Join(Environment.NewLine, pingFailures.Take(10));
            await errorDisplayServer.ShowErrorAsync(
                source: "server-list-service.populate-server-pings",
                userMessage: "Some servers could not be pinged. Ping values may be stale.",
                code: "SERVER_PING_PARTIAL_FAILURE",
                technicalDetails: details,
                isTransient: true);
        }
    }

    private static int ParsePingMs(string pingResult)
    {
        if (string.IsNullOrWhiteSpace(pingResult))
        {
            return 0;
        }

        string normalized = pingResult.Trim();

        if (!normalized.EndsWith("ms", StringComparison.OrdinalIgnoreCase))
        {
            return 0;
        }

        string value = normalized[..^2].Trim();

        if (!double.TryParse(value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out double parsed))
        {
            return 0;
        }

        if (double.IsNaN(parsed) || double.IsInfinity(parsed))
        {
            return 0;
        }

        return Math.Max(0, (int)Math.Round(parsed, MidpointRounding.AwayFromZero));
    }
}
