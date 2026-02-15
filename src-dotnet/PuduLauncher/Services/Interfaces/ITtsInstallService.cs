using PuduLauncher.Abstractions.Interfaces;

namespace PuduLauncher.Services.Interfaces;

public interface ITtsInstallService
{
    Task DownloadInstallerAsync(string downloadUrl, string zipPath, CancellationToken ct = default);
    Task RunInstallerAsync(string extractDir, string installPath, CancellationToken ct = default);
}
