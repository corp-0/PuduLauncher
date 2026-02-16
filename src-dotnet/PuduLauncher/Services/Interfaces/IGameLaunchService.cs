namespace PuduLauncher.Services.Interfaces;

public interface IGameLaunchService
{
    Task LaunchGameAsync(
        Guid installationId,
        string? serverIp = null,
        int? serverPort = null,
        string? serverName = null,
        string? gameMode = null,
        string? currentMap = null);
    bool IsGameRunning(string forkName, int buildVersion);
}
