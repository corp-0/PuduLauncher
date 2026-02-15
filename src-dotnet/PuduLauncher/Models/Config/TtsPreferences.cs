using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("TTS")]
public class TtsPreferences
{
    [PreferenceField("Enable TTS", "toggle")]
    public bool Enabled { get; set; }

    [PreferenceField("Installation Path", "path")]
    public string InstallPath { get; set; } = "";
}
