namespace PuduLauncher.Models.Discord;

public sealed class DiscordJoinSecret
{
    public string Ip { get; init; } = string.Empty;
    public int Port { get; init; }
    public string Fork { get; init; } = string.Empty;
    public int Build { get; init; }
}
