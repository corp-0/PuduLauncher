using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

[PuduEvent("download:progress")]
public sealed class DownloadProgressEvent : EventBase
{
    public string ForkName { get; init; } = string.Empty;
    public int BuildVersion { get; init; }
    public long Downloaded { get; init; }
    public long Size { get; init; }
    public int Progress { get; init; }
}
