using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;

namespace PuduLauncher.Services.Interfaces;

public interface IInstallationWorkflowService
{
    Task StartServerDownloadAsync(GameServer server);
    Task StartRegistryDownloadAsync(int buildVersion);
    public Task<List<RegistryBuild>> ListRegistryBuildsAsync();
}
