using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Installations;

namespace PuduLauncher.Models.Events;

[PuduEvent("installations:changed")]
public sealed class InstallationsChangedEvent : EventBase
{
    public List<Installation> Installations { get; init; } = [];
}
