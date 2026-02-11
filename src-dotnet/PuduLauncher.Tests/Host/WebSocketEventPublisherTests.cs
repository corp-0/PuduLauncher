using System.Net.WebSockets;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Host.Infrastructure;
using PuduLauncher.Models.Events;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Host;

public class WebSocketEventPublisherTests
{
    [Fact]
    public void HasConnectedClients_OnlyCountsOpenSockets()
    {
        var publisher = new WebSocketEventPublisher(NullLogger<WebSocketEventPublisher>.Instance);
        var openSocket = new TestWebSocket(WebSocketState.Open);
        var closedSocket = new TestWebSocket(WebSocketState.Closed);

        publisher.AddClient(openSocket);
        publisher.AddClient(closedSocket);

        Assert.True(publisher.HasConnectedClients);

        openSocket.SetState(WebSocketState.Closed);

        Assert.False(publisher.HasConnectedClients);
    }

    [Fact]
    public async Task PublishAsync_SendsToOpenSockets_AndSkipsClosedOnes()
    {
        var publisher = new WebSocketEventPublisher(NullLogger<WebSocketEventPublisher>.Instance);
        var openSocket = new TestWebSocket(WebSocketState.Open);
        var closedSocket = new TestWebSocket(WebSocketState.Closed);

        publisher.AddClient(openSocket);
        publisher.AddClient(closedSocket);

        await publisher.PublishAsync(new TimerEvent { ElapsedTime = "00:42" });

        Assert.Single(openSocket.SentMessages);
        Assert.Empty(closedSocket.SentMessages);

        using JsonDocument document = JsonDocument.Parse(openSocket.SentMessages[0]);
        JsonElement root = document.RootElement;

        Assert.Equal("timer:tick", root.GetProperty("eventType").GetString());
        Assert.Equal("00:42", root.GetProperty("elapsedTime").GetString());
        Assert.True(root.TryGetProperty("timestamp", out _));
    }

    [Fact]
    public async Task PublishAsync_WhenOneSocketFails_ContinuesSendingToOthers()
    {
        var publisher = new WebSocketEventPublisher(NullLogger<WebSocketEventPublisher>.Instance);
        var failingSocket = new TestWebSocket(WebSocketState.Open, new InvalidOperationException("send failed"));
        var healthySocket = new TestWebSocket(WebSocketState.Open);

        publisher.AddClient(failingSocket);
        publisher.AddClient(healthySocket);

        await publisher.PublishAsync(new TimerEvent { ElapsedTime = "01:00" });

        Assert.Single(healthySocket.SentMessages);
        Assert.Empty(failingSocket.SentMessages);
    }

    [Fact]
    public async Task PublishAsync_WhenEventIsNull_ThrowsArgumentNullException()
    {
        var publisher = new WebSocketEventPublisher(NullLogger<WebSocketEventPublisher>.Instance);

        await Assert.ThrowsAsync<ArgumentNullException>(
            () => publisher.PublishAsync<TimerEvent>(null!));
    }
}
