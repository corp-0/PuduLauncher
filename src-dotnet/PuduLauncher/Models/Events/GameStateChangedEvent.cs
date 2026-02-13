using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

[PuduEvent("game:state-changed")]
public sealed class GameStateChangedEvent : EventBase
{
    public string ServerIp { get; init; } = string.Empty;
    public int ServerPort { get; init; }
    public bool IsRunning { get; init; }
}
