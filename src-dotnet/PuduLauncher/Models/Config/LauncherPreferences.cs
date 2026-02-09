using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Launcher")]
public class LauncherPreferences
{
    [PreferenceField("Enable TTS", "toggle")]
    public bool IsTtsEnabled { get; set; } = true;

    [PreferenceField("Ignore Version Update", "number")]
    public int IgnoreVersionUpdate { get; set; }
}
