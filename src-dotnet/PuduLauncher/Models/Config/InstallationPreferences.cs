using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Installations")]
public class InstallationPreferences
{
    [PreferenceField("Clean up old builds", "toggle", Tooltip = "When enabled, older builds from the same fork are deleted after installing a newer one.")]
    public bool AutoRemove { get; set; }

    [PreferenceField("Installation path", "path", Tooltip = "Base folder where downloaded server builds are installed.")]
    public string InstallationPath { get; set; } = "";
}
