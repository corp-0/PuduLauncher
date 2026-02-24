using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Enums;

namespace PuduLauncher.Models.Events;

[PuduEvent("ipc:permission-request")]
public sealed class IpcPermissionRequestEvent : EventBase
{
    public Guid RequestId { get; init; }
    public IpcRequestType RequestType { get; init; }
    public string Domain { get; init; } = string.Empty;
    public string Justification { get; init; } = string.Empty;
}
