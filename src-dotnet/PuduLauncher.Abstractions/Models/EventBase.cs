namespace PuduLauncher.Abstractions.Models;

/// <summary>
/// Base class for all events published from the sidecar to the frontend via WebSocket.
/// </summary>
public abstract class EventBase
{
    /// <summary>
    /// Gets the type of the event, used by the frontend to route events to the correct handler.
    /// </summary>
    public string EventType { get; }

    /// <summary>
    /// Gets the timestamp when the event was created.
    /// </summary>
    public DateTimeOffset Timestamp { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="EventBase"/> class.
    /// </summary>
    /// <param name="eventType">The event type identifier (e.g., "download:progress").</param>
    protected EventBase(string eventType)
    {
        if (string.IsNullOrWhiteSpace(eventType))
            throw new ArgumentException("Event type cannot be null or whitespace.", nameof(eventType));

        EventType = eventType;
        Timestamp = DateTimeOffset.UtcNow;
    }
}
