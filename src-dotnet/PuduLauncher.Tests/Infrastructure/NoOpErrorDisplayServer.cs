using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Tests.Infrastructure;

internal sealed class NoOpErrorDisplayServer : IErrorDisplayServer
{
    public List<FrontendErrorEvent> Errors { get; } = [];

    public Task ShowErrorAsync(
        string source,
        string userMessage,
        string? code = null,
        string? technicalDetails = null,
        bool isTransient = true,
        string? correlationId = null,
        CancellationToken cancellationToken = default)
    {
        Errors.Add(new FrontendErrorEvent
        {
            Severity = "error",
            Source = source,
            Code = code,
            UserMessage = userMessage,
            TechnicalDetails = technicalDetails,
            CorrelationId = correlationId,
            IsTransient = isTransient,
        });
        return Task.CompletedTask;
    }

    public Task ShowFatalAsync(
        string source,
        string userMessage,
        string? code = null,
        string? technicalDetails = null,
        string? correlationId = null,
        CancellationToken cancellationToken = default)
    {
        Errors.Add(new FrontendErrorEvent
        {
            Severity = "fatal",
            Source = source,
            Code = code,
            UserMessage = userMessage,
            TechnicalDetails = technicalDetails,
            CorrelationId = correlationId,
            IsTransient = false,
        });
        return Task.CompletedTask;
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
        return fatal
            ? ShowFatalAsync(source, userMessage, code, exception.ToString(), correlationId, cancellationToken)
            : ShowErrorAsync(source, userMessage, code, exception.ToString(), isTransient, correlationId,
                cancellationToken);
    }

    public IReadOnlyList<FrontendErrorEvent> GetRecentErrors()
    {
        return Errors.ToList();
    }
}
