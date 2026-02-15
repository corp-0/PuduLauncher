using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Launcher")]
public class LauncherPreferences
{
    [PreferenceField("Ignore Version Update", "number")]
    public int IgnoreVersionUpdate { get; set; }
}
