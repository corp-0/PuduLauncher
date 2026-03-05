using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Enums;

namespace PuduLauncher.Models.Events;

[PuduEvent("discord:join-request")]
public sealed class DiscordJoinRequestEvent : EventBase
{
    public string ServerIp { get; init; } = string.Empty;
    public int ServerPort { get; init; }
    public string? ServerName { get; init; }
    public string ForkName { get; init; } = string.Empty;
    public int BuildVersion { get; init; }
    public string? GameMode { get; init; }
    public string? CurrentMap { get; init; }
    public int PlayerCount { get; init; }
    public int PlayerCountMax { get; init; }
    public DiscordJoinStatus Status { get; init; }
}
