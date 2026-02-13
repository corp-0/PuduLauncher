using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("downloads")]
public class DownloadController(
    IDownloadService downloadService,
    IInstallationWorkflowService installationWorkflowService)
{
    [PuduCommand]
    public async Task StartDownload(GameServer server)
    {
        await installationWorkflowService.StartServerDownloadAsync(server);
    }

    [PuduCommand]
    public async Task CancelDownload(string forkName, int buildVersion)
    {
        await downloadService.CancelDownloadAsync(forkName, buildVersion);
    }

    [PuduCommand]
    public List<Download> GetActiveDownloads()
    {
        return downloadService.GetActiveDownloads();
    }
}
