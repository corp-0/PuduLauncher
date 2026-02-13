using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Models.Events;

[PuduEvent("frontend:error")]
public sealed class FrontendErrorEvent : EventBase
{
    public string Id { get; init; } = Guid.NewGuid().ToString("N");
    public string Severity { get; init; } = "error";
    public string Source { get; init; } = string.Empty;
    public string? Code { get; init; }
    public string UserMessage { get; init; } = string.Empty;
    public string? TechnicalDetails { get; init; }
    public string? CorrelationId { get; init; }
    public bool IsTransient { get; init; } = true;
}
