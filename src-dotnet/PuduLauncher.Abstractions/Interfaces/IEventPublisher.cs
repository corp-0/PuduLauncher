using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Abstractions.Interfaces;

/// <summary>
/// Publishes events to all connected frontend clients via WebSocket.
/// Inject this interface into controllers or hosted services to send real-time events.
/// </summary>
public interface IEventPublisher
{
    /// <summary>
    /// Whether any frontend clients are currently connected via WebSocket.
    /// Background services can use this to skip work when nobody is listening.
    /// </summary>
    bool HasConnectedClients { get; }

    /// <summary>
    /// Publishes an event to all connected WebSocket clients.
    /// </summary>
    /// <typeparam name="TEvent">The type of event to publish (must inherit from EventBase).</typeparam>
    /// <param name="eventData">The event data to publish.</param>
    /// <param name="cancellationToken">A cancellation token to cancel the operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task PublishAsync<TEvent>(TEvent eventData, CancellationToken cancellationToken = default)
        where TEvent : EventBase;
}
