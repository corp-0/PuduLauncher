namespace PuduLauncher.Models.Discord;

public sealed class AcceptDiscordJoinRequest
{
    public string ServerIp { get; init; } = string.Empty;
    public int ServerPort { get; init; }
}
