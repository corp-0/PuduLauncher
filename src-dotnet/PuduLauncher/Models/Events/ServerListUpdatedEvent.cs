using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Game;

namespace PuduLauncher.Models.Events;

[PuduEvent("servers:updated")]
public sealed class ServerListUpdatedEvent : EventBase
{
    public List<GameServer> Servers { get; init; } = [];
}
