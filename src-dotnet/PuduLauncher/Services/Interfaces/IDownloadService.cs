using PuduLauncher.Models.Installations;

namespace PuduLauncher.Services.Interfaces;

public interface IDownloadService
{
    Task StartDownloadAsync(
        DownloadStartRequest request,
        Func<DownloadedInstallation, CancellationToken, Task> onInstalledAsync);
    Task CancelDownloadAsync(string forkName, int buildVersion);
    Download? GetDownload(string forkName, int buildVersion);
    List<Download> GetActiveDownloads();
}
