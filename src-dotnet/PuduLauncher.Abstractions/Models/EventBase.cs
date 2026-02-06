using System.Collections.Concurrent;
using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Abstractions.Models;

/// <summary>
/// Base class for all events published from the sidecar to the frontend via WebSocket.
/// </summary>
public abstract class EventBase
{
    private static readonly ConcurrentDictionary<Type, string> EventTypeCache = new();

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
    protected EventBase()
    {
        EventType = EventTypeCache.GetOrAdd(GetType(), ResolveEventType);
        Timestamp = DateTimeOffset.UtcNow;
    }

    private static string ResolveEventType(Type eventModelType)
    {
        var eventAttribute = (PuduEventAttribute?)Attribute.GetCustomAttribute(
            eventModelType,
            typeof(PuduEventAttribute),
            inherit: false);

        if (eventAttribute is null || string.IsNullOrWhiteSpace(eventAttribute.Name))
        {
            throw new InvalidOperationException(
                $"Event model '{eventModelType.FullName}' must be decorated with [PuduEvent(\"...\")].");
        }

        return eventAttribute.Name;
    }
}
