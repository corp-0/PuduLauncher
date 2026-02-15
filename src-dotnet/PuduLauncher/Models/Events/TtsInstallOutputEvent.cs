using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

[PuduEvent("tts:install-output")]
public sealed class TtsInstallOutputEvent : EventBase
{
    public string Line { get; init; } = string.Empty;
}
