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
        return serverData?.Servers ?? [];
    }
}