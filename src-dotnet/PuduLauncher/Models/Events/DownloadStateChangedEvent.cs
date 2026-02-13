using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Installations;

namespace PuduLauncher.Models.Events;

[PuduEvent("download:state-changed")]
public sealed class DownloadStateChangedEvent : EventBase
{
    public string ForkName { get; init; } = string.Empty;
    public int BuildVersion { get; init; }
    public DownloadState State { get; init; }
    public string? ErrorMessage { get; init; }
}
