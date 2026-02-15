namespace PuduLauncher.Models.Tts;

public class TtsState
{
    public TtsStatus Status { get; set; }
    public string? InstalledVersion { get; set; }
    public string? LatestVersion { get; set; }
    public bool UpdateAvailable { get; set; }
    public string? InstallPath { get; set; }
    public string? ErrorMessage { get; set; }
}
