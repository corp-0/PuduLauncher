using PuduLauncher.Models.Game;

namespace PuduLauncher.Services.Interfaces;

public interface IInstallationWorkflowService
{
    Task StartServerDownloadAsync(GameServer server);
    Task StartRegistryDownloadAsync(int buildVersion);
}
