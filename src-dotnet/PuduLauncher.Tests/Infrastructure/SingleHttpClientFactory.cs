namespace PuduLauncher.Tests.Infrastructure;

internal sealed class SingleHttpClientFactory(HttpClient client) : IHttpClientFactory
{
    private readonly HttpClient _client = client;

    public HttpClient CreateClient(string name)
    {
        return _client;
    }
}
