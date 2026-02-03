using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

/// <summary>
/// Event fired every second with elapsed time since application started.
/// </summary>
public sealed class TimerEvent : EventBase
{
    public TimerEvent() : base("timer:tick")
    {
    }

    /// <summary>
    /// Elapsed time formatted as "mm:ss"
    /// </summary>
    public string ElapsedTime { get; init; } = string.Empty;
}
