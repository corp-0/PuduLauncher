using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Launcher")]
public class LauncherPreferences
{
    [PreferenceField("Theme", "select",
        Options =
        [
            "Pudu",
            "Unitystation Classic",
            "Austral Forest Night",
            "Doors95",
            "Hotdog Stand"
        ])]
    public string Theme { get; set; } = "Pudu";
    
    [PreferenceField("Enable Discord rich presence", "toggle",
        Tooltip = "If enabled, Discord will get rich presence data from Pudu")]
    public bool EnableDiscordRichPresence { get; set; }
}
