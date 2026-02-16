using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Launcher")]
public class LauncherPreferences
{
    [PreferenceField("Theme", "select",
    Options = new[] {
        "Pudu",
        "Unitystation Classic",
        "Austral Forest Night",
        "Doors95",
        "Hotdog Stand"
    })]
    public string Theme { get; set; } = "Pudu";
}
