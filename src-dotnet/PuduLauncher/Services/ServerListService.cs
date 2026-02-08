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
    ILogger<ServerListService> logger) : BackgroundService, IServerListService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
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

            var interval = TimeSpan.FromSeconds(preferences.GetPreferences().ServerListFetchIntervalSeconds);
            await Task.Delay(interval, stoppingToken);
        }
    }

    public async Task<List<GameServer>> FetchServerListAsync(CancellationToken ct = default)
    {
        using HttpClient client = httpClientFactory.CreateClient();
        string data = await client.GetStringAsync(preferences.GetPreferences().ServerListApi, ct);
        ServerList? serverData = JsonSerializer.Deserialize(data, JsonCtx.Default.ServerList);
        return serverData?.Servers ?? [];
    }
}