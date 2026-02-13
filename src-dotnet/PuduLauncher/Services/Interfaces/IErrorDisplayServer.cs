using PuduLauncher.Models.Events;

namespace PuduLauncher.Services.Interfaces;

public interface IErrorDisplayServer
{
    Task ShowErrorAsync(
        string source,
        string userMessage,
        string? code = null,
        string? technicalDetails = null,
        bool isTransient = true,
        string? correlationId = null,
        CancellationToken cancellationToken = default);

    Task ShowFatalAsync(
        string source,
        string userMessage,
        string? code = null,
        string? technicalDetails = null,
        string? correlationId = null,
        CancellationToken cancellationToken = default);

    Task ShowExceptionAsync(
        Exception exception,
        string source,
        string userMessage,
        string? code = null,
        bool fatal = false,
        bool isTransient = true,
        string? correlationId = null,
        CancellationToken cancellationToken = default);

    IReadOnlyList<FrontendErrorEvent> GetRecentErrors();
}
