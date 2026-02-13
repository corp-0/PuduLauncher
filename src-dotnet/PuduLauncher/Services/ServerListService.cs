using System.Text.Json;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Game;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class ServerListService(
    IHttpClientFactory httpClientFactory,
    IPreferencesService preferences,
    IEventPublisher eventPublisher,
    IPingService pingService,
    ILogger<ServerListService> logger) : BackgroundService, IServerListService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (!eventPublisher.HasConnectedClients)
            {
                logger.LogDebug("No clients connected, skipping server list fetch");
                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                continue;
            }

            try
            {
                var servers = await FetchServerListAsync(stoppingToken);
                await eventPublisher.PublishAsync(new ServerListUpdatedEvent { Servers = servers }, stoppingToken);
                logger.LogDebug("Published server list with {Count} servers", servers.Count);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch server list");
            }

            var interval = TimeSpan.FromSeconds(preferences.GetPreferences().Servers.ServerListFetchIntervalSeconds);
            await Task.Delay(interval, stoppingToken);
        }
    }

    public async Task<List<GameServer>> FetchServerListAsync(CancellationToken ct = default)
    {
        using HttpClient client = httpClientFactory.CreateClient();
        string data = await client.GetStringAsync(preferences.GetPreferences().Servers.ServerListApi, ct);
        ServerList? serverData = JsonSerializer.Deserialize(data, JsonCtx.Default.ServerList);
        List<GameServer> servers = serverData?.Servers ?? [];

        await PopulateServerPingsAsync(servers);

        return servers;
    }

    private async Task PopulateServerPingsAsync(List<GameServer> servers)
    {
        if (servers.Count == 0)
        {
            return;
        }

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
                server.PingMs = 0;
            }
        }).ToArray();

        await Task.WhenAll(pingTasks);
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
