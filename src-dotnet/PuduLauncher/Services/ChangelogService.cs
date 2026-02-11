using System.Text.Json;
using PuduLauncher.Constants;
using PuduLauncher.Models.Changelog;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class ChangelogService(IHttpClientFactory httpClientFactory, ILogger<ChangelogService> logger) : IChangelogService
{
    public async Task<List<ChangelogEntry>> GetChangelogAsync(int count)
    {
        using HttpClient client = httpClientFactory.CreateClient();

        string changelogJson = await client.GetStringAsync(Api.Latest10VersionsUrl);
        ChangelogList changelogList = JsonSerializer.Deserialize(changelogJson, JsonCtx.Default.ChangelogList) ?? new();

        logger.LogDebug("Fetched {Count} changelog entries", changelogList.Changes.Count);
        return changelogList.Changes.Take(count).ToList();
    }
}
