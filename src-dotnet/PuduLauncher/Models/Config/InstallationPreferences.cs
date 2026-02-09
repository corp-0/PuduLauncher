using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Installations")]
public class InstallationPreferences
{
    [PreferenceField("Auto Remove", "toggle")]
    public bool AutoRemove { get; set; }

    [PreferenceField("Installation Path", "path")]
    public string InstallationPath { get; set; } = "";
}
