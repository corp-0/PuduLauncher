using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Tts;

namespace PuduLauncher.Models.Events;

[PuduEvent("tts:status-changed")]
public sealed class TtsStatusChangedEvent : EventBase
{
    public TtsStatus Status { get; init; }
    public string? Message { get; init; }
}
