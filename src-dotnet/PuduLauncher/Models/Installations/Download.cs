namespace PuduLauncher.Models.Installations;

public class Download
{
    public string ForkName { get; set; } = string.Empty;
    public int BuildVersion { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
    public string GoodFileVersion { get; set; } = string.Empty;
    public string InstallPath { get; set; } = string.Empty;
    public long Size { get; set; }
    public long Downloaded { get; set; }
    public int Progress { get; set; }
    public DownloadState State { get; set; } = DownloadState.NotDownloaded;
    public string? ErrorMessage { get; set; }
}
