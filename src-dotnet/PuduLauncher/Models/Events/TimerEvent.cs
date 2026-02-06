using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

/// <summary>
/// Event fired every second with elapsed time since application started.
/// </summary>
[PuduEvent("timer:tick")]
public sealed class TimerEvent : EventBase
{
    /// <summary>
    /// Elapsed time formatted as "mm:ss"
    /// </summary>
    public string ElapsedTime { get; init; } = string.Empty;
}
