using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

[PuduEvent("tts:update-available")]
public sealed class TtsUpdateAvailableEvent : EventBase
{
    public string InstalledVersion { get; init; } = string.Empty;
    public string LatestVersion { get; init; } = string.Empty;
}
