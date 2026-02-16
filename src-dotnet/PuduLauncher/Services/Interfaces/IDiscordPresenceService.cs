namespace PuduLauncher.Services.Interfaces;

public interface IDiscordPresenceService : IHostedService
{
    void SetLauncherState();
    void SetInServerState(ServerPresenceInfo info);
    void SetInBuildState(BuildPresenceInfo info);
    void StartGameSession(GameSessionPresenceInfo info);
}

public record ServerPresenceInfo(
    string? ForkName = null,
    string? ServerName = null,
    string? GameMode = null,
    string? CurrentMap = null,
    string? ServerIp = null,
    int? ServerPort = null);

public record BuildPresenceInfo(
    string? ForkName = null,
    int? BuildVersion = null);

public record GameSessionPresenceInfo(
    string? ForkName = null,
    int? BuildVersion = null,
    string? ServerIp = null,
    int? ServerPort = null);
