using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Tests.Infrastructure;

internal sealed class NoOpEventPublisher : IEventPublisher
{
    public bool HasConnectedClients { get; set; }

    public List<EventBase> PublishedEvents { get; } = [];

    public Task PublishAsync<TEvent>(TEvent eventData, CancellationToken cancellationToken = default)
        where TEvent : EventBase
    {
        PublishedEvents.Add(eventData);
        return Task.CompletedTask;
    }
}
