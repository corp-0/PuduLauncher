namespace PuduLauncher.Models.Installations;

public enum DownloadState
{
    NotDownloaded,
    InProgress,
    Extracting,
    Scanning,
    Installed,
    Failed,
    ScanFailed
}
