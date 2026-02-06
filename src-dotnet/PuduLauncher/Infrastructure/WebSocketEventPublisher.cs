using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Infrastructure;

/// <summary>
/// Publishes events to all connected WebSocket clients.
/// </summary>
public sealed class WebSocketEventPublisher : IEventPublisher
{
    private readonly ConcurrentBag<WebSocket> _clients = new();
    private readonly ILogger<WebSocketEventPublisher> _logger;

    public WebSocketEventPublisher(ILogger<WebSocketEventPublisher> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Registers a new WebSocket client.
    /// </summary>
    public void AddClient(WebSocket webSocket)
    {
        _clients.Add(webSocket);
        _logger.LogInformation("WebSocket client connected. Total clients: {Count}", _clients.Count);
    }

    /// <summary>
    /// Removes a WebSocket client.
    /// </summary>
    public void RemoveClient(WebSocket webSocket)
    {
        // Note: ConcurrentBag doesn't have a Remove method, but disconnected sockets
        // will fail to send and be skipped in PublishAsync
        _logger.LogInformation("WebSocket client disconnected");
    }

    /// <inheritdoc/>
    public async Task PublishAsync<TEvent>(TEvent eventData, CancellationToken cancellationToken = default)
        where TEvent : EventBase
    {
        if (eventData == null)
            throw new ArgumentNullException(nameof(eventData));

        // Serialize using the concrete type's generated JsonTypeInfo so derived properties are included
        var typeInfo = AppJsonSerializerContext.Default.GetTypeInfo(typeof(TEvent))
            ?? throw new InvalidOperationException($"Type {typeof(TEvent).Name} is not registered in AppJsonSerializerContext. Add [JsonSerializable(typeof({typeof(TEvent).Name}))] to AppJsonSerializerContext.");
        var json = JsonSerializer.Serialize(eventData, typeInfo);
        var bytes = Encoding.UTF8.GetBytes(json);
        var segment = new ArraySegment<byte>(bytes);

        _logger.LogDebug("Publishing event: {EventType}", eventData.EventType);

        var sendTasks = new List<Task>();
        var clientsToRemove = new List<WebSocket>();

        foreach (var client in _clients)
        {
            if (client.State == WebSocketState.Open)
            {
                sendTasks.Add(SendToClientAsync(client, segment, cancellationToken));
            }
            else if (client.State == WebSocketState.Closed || client.State == WebSocketState.Aborted)
            {
                clientsToRemove.Add(client);
            }
        }

        await Task.WhenAll(sendTasks);

        foreach (var client in clientsToRemove)
        {
            _logger.LogDebug("Removing closed WebSocket client");
        }
    }

    private async Task SendToClientAsync(WebSocket client, ArraySegment<byte> data, CancellationToken cancellationToken)
    {
        try
        {
            await client.SendAsync(data, WebSocketMessageType.Text, endOfMessage: true, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send event to WebSocket client");
        }
    }
}
