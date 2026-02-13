using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using JsonCtx = PuduLauncher.JsonCtx;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Host.Infrastructure;

/// <summary>
/// Publishes events to all connected WebSocket clients.
/// </summary>
public sealed class WebSocketEventPublisher : IEventPublisher
{
    private readonly ConcurrentDictionary<WebSocket, byte> _clients = new();
    private readonly ILogger<WebSocketEventPublisher> _logger;

    public WebSocketEventPublisher(ILogger<WebSocketEventPublisher> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc/>
    public bool HasConnectedClients => _clients.Keys.Any(c => c.State == WebSocketState.Open);

    /// <summary>
    /// Registers a new WebSocket client.
    /// </summary>
    public void AddClient(WebSocket webSocket)
    {
        _clients.TryAdd(webSocket, 0);
        _logger.LogDebug("WebSocket client connected. Total clients: {Count}", _clients.Count);
    }

    /// <summary>
    /// Removes a WebSocket client.
    /// </summary>
    public void RemoveClient(WebSocket webSocket)
    {
        _clients.TryRemove(webSocket, out _);
        _logger.LogDebug("WebSocket client disconnected. Total clients: {Count}", _clients.Count);
    }

    /// <inheritdoc/>
    public async Task PublishAsync<TEvent>(TEvent eventData, CancellationToken cancellationToken = default)
        where TEvent : EventBase
    {
        if (eventData == null)
            throw new ArgumentNullException(nameof(eventData));

        // Serialize using the concrete type's generated JsonTypeInfo so derived properties are included
        var typeInfo = JsonCtx.Default.GetTypeInfo(typeof(TEvent))
            ?? throw new InvalidOperationException($"Type {typeof(TEvent).Name} is not registered in JsonCtx. Run 'npm run generate-ts' to refresh src-dotnet/PuduLauncher/Host/Serialization/JsonCtx.Models.g.cs.");
        var json = JsonSerializer.Serialize(eventData, typeInfo);
        var bytes = Encoding.UTF8.GetBytes(json);
        var segment = new ArraySegment<byte>(bytes);

        _logger.LogDebug("Publishing event: {EventType}", eventData.EventType);

        var sendTasks = new List<Task>();
        var clientsToRemove = new List<WebSocket>();

        foreach (var client in _clients.Keys)
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
            _clients.TryRemove(client, out _);
            _logger.LogDebug("Removed closed WebSocket client. Total clients: {Count}", _clients.Count);
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
