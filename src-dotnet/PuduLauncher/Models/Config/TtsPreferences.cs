using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("TTS", layout: "TtsPreferencesLayout")]
public class TtsPreferences
{
    public bool Enabled { get; set; }

    public string InstallPath { get; set; } = "";
}
