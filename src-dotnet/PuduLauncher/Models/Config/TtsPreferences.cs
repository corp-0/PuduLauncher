using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("TTS", layout: "TtsPreferencesLayout")]
public class TtsPreferences
{
    [PreferenceField("Enable HonkTTS", "toggle", Tooltip = "Turns immersive voices on or off.")]
    public bool Enabled { get; set; }

    [PreferenceField("Install path", "path", Tooltip = "Folder where the HonkTTS runtime is installed.")]
    public string InstallPath { get; set; } = "";

    [PreferenceField("Start on launcher startup", "toggle", Tooltip = "Automatically starts HonkTTS when PuduLauncher starts.")]
    public bool AutoStartOnLaunch { get; set; } = true;
}
