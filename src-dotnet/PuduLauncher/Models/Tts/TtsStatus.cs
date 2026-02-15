namespace PuduLauncher.Models.Tts;

public enum TtsStatus
{
    NotInstalled,
    CheckingForUpdates,
    Downloading,
    Installing,
    Installed,
    ServerStarting,
    ServerRunning,
    ServerStopped,
    Error
}
