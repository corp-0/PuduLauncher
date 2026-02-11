using System.Net;

namespace PuduLauncher.Tests.Infrastructure;

internal sealed class DelegateHttpMessageHandler(
    Func<HttpRequestMessage, CancellationToken, HttpResponseMessage> handler) : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, CancellationToken, HttpResponseMessage> _handler = handler;

    public List<Uri> RequestedUris { get; } = [];

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (request.RequestUri is not null)
        {
            RequestedUris.Add(request.RequestUri);
        }

        HttpResponseMessage response = _handler(request, cancellationToken);
        response.RequestMessage ??= request;

        return Task.FromResult(response);
    }

    public static HttpResponseMessage Json(string payload, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        return new HttpResponseMessage(statusCode)
        {
            Content = new StringContent(payload)
        };
    }
}
