using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public sealed class ErrorDisplayServer(
    IEventPublisher eventPublisher,
    ILogger<ErrorDisplayServer> logger) : IErrorDisplayServer
{
    private const int MaxRecentErrors = 100;
    private static readonly TimeSpan DedupeWindow = TimeSpan.FromSeconds(30);

    private readonly object _syncRoot = new();
    private readonly Queue<FrontendErrorEvent> _recentErrors = new();
    private readonly Dictionary<string, DateTimeOffset> _recentFingerprints = new(StringComparer.Ordinal);

    public Task ShowErrorAsync(
        string source,
        string userMessage,
        string? code = null,
        string? technicalDetails = null,
        bool isTransient = true,
        string? correlationId = null,
        CancellationToken cancellationToken = default)
    {
        var errorEvent = new FrontendErrorEvent
        {
            Severity = "error",
            Source = source,
            Code = code,
            UserMessage = userMessage,
            TechnicalDetails = technicalDetails,
            CorrelationId = correlationId,
            IsTransient = isTransient,
        };

        return PushAsync(errorEvent, cancellationToken);
    }

    public Task ShowFatalAsync(
        string source,
        string userMessage,
        string? code = null,
        string? technicalDetails = null,
        string? correlationId = null,
        CancellationToken cancellationToken = default)
    {
        var errorEvent = new FrontendErrorEvent
        {
            Severity = "fatal",
            Source = source,
            Code = code,
            UserMessage = userMessage,
            TechnicalDetails = technicalDetails,
            CorrelationId = correlationId,
            IsTransient = false,
        };

        return PushAsync(errorEvent, cancellationToken);
    }

    public Task ShowExceptionAsync(
        Exception exception,
        string source,
        string userMessage,
        string? code = null,
        bool fatal = false,
        bool isTransient = true,
        string? correlationId = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(exception);

        return fatal
            ? ShowFatalAsync(source, userMessage, code, exception.ToString(), correlationId, cancellationToken)
            : ShowErrorAsync(source, userMessage, code, exception.ToString(), isTransient, correlationId,
                cancellationToken);
    }

    public IReadOnlyList<FrontendErrorEvent> GetRecentErrors()
    {
        lock (_syncRoot)
        {
            return _recentErrors.ToList();
        }
    }

    private async Task PushAsync(FrontendErrorEvent errorEvent, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(errorEvent.Source) || string.IsNullOrWhiteSpace(errorEvent.UserMessage))
        {
            return;
        }

        if (!TrackAndFilter(errorEvent))
        {
            return;
        }

        if (!eventPublisher.HasConnectedClients)
        {
            return;
        }

        try
        {
            await eventPublisher.PublishAsync(errorEvent, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex,
                "Failed to publish frontend error event {Severity}/{Source}/{Code}",
                errorEvent.Severity, errorEvent.Source, errorEvent.Code);
        }
    }

    private bool TrackAndFilter(FrontendErrorEvent errorEvent)
    {
        var now = DateTimeOffset.UtcNow;
        string fingerprint = BuildFingerprint(errorEvent);

        lock (_syncRoot)
        {
            if (_recentFingerprints.TryGetValue(fingerprint, out DateTimeOffset lastSeenAt))
            {
                if ((now - lastSeenAt) < DedupeWindow)
                {
                    return false;
                }
            }

            _recentFingerprints[fingerprint] = now;
            _recentErrors.Enqueue(errorEvent);

            while (_recentErrors.Count > MaxRecentErrors)
            {
                _recentErrors.Dequeue();
            }

            return true;
        }
    }

    private static string BuildFingerprint(FrontendErrorEvent errorEvent)
    {
        return string.Join("|",
            errorEvent.Severity,
            errorEvent.Source,
            errorEvent.Code ?? string.Empty,
            errorEvent.UserMessage);
    }
}
