namespace PuduLauncher.Services.Interfaces;

public interface IScannerService
{
    Task<bool> ScanInstallationAsync(string installPath, string goodFileVersion, CancellationToken ct);
}
