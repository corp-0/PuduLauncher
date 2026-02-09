namespace PuduLauncher.Models.Config;

public class Preferences
{
    public const int CurrentVersion = 2;

    public int Version { get; set; } = CurrentVersion;
    public LauncherPreferences Launcher { get; set; } = new();
    public ServerPreferences Servers { get; set; } = new();
    public InstallationPreferences Installations { get; set; } = new();
}
