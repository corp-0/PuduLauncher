namespace PuduLauncher.Services.Interfaces;

public interface IDiscordPresenceService : IHostedService
{
    void SetLauncherState();
    void SetInServerState(ServerPresenceInfo info);
}

public record ServerPresenceInfo(
    string? ForkName = null,
    string? ServerName = null,
    string? GameMode = null,
    string? CurrentMap = null,
    string? ServerIp = null,
    int? ServerPort = null);
