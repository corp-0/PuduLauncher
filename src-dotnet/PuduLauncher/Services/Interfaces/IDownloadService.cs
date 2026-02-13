using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;

namespace PuduLauncher.Services.Interfaces;

public interface IDownloadService
{
    Task StartDownloadAsync(GameServer server);
    Task CancelDownloadAsync(string forkName, int buildVersion);
    Download? GetDownload(string forkName, int buildVersion);
    List<Download> GetActiveDownloads();
}
