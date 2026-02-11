using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Constants;
using PuduLauncher.Services;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class ChangelogServiceTests
{
    [Fact]
    public async Task GetChangelogAsync_ReturnsFirstNEntriesPreservingApiOrder()
    {
        const string payload = """
                               {
                                 "count": 599,
                                 "next": "https://changelog.unitystation.org/all-changes?format=json&limit=10&offset=10",
                                 "previous": null,
                                 "results": [
                                   {
                                     "version_number": "oldest-in-page",
                                     "date_created": "2026-02-10",
                                     "changes": [
                                       {
                                         "author_username": "Bod9001",
                                         "author_url": "https://github.com/Bod9001",
                                         "description": "You can now load bullets into magazines",
                                         "pr_url": "https://github.com/unitystation/unitystation/pull/11107",
                                         "pr_number": 11107,
                                         "category": "NEW",
                                         "build": "26021013",
                                         "date_added": "2026-02-10"
                                       }
                                     ]
                                   },
                                   {
                                     "version_number": "middle-in-page",
                                     "date_created": "2026-02-06",
                                     "changes": [
                                       {
                                         "author_username": "MaxIsJoe",
                                         "description": "Doors can now have more than one deconstruction method",
                                         "category": "NEW"
                                       }
                                     ]
                                   },
                                   {
                                     "version_number": "newest-in-page",
                                     "date_created": "2026-01-31",
                                     "changes": [
                                       {
                                         "author_username": "Bod9001",
                                         "description": "adds AI VOX",
                                         "category": "NEW"
                                       }
                                     ]
                                   }
                                 ]
                               }
                               """;

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(Api.Latest10VersionsUrl, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json(payload);
        });

        using var client = new HttpClient(handler);
        var service = new ChangelogService(new SingleHttpClientFactory(client), NullLogger<ChangelogService>.Instance);

        var changelogEntries = await service.GetChangelogAsync(2);

        Assert.Equal(2, changelogEntries.Count);
        Assert.Equal(
            new[] { "oldest-in-page", "middle-in-page" },
            changelogEntries.Select(entry => entry.Version));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetChangelogAsync_WhenCountIsZeroOrNegative_ReturnsEmpty(int count)
    {
        const string payload = """
                               {
                                 "results": [
                                   { "version_number": "one", "date_created": "2026-02-10", "changes": [] },
                                   { "version_number": "two", "date_created": "2026-02-09", "changes": [] }
                                 ]
                               }
                               """;

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(Api.Latest10VersionsUrl, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json(payload);
        });

        using var client = new HttpClient(handler);
        var service = new ChangelogService(new SingleHttpClientFactory(client), NullLogger<ChangelogService>.Instance);

        var changelogEntries = await service.GetChangelogAsync(count);

        Assert.Empty(changelogEntries);
    }

    [Theory]
    [InlineData("null")]
    [InlineData("{}")]
    public async Task GetChangelogAsync_WhenPayloadIsNullOrMissingResults_ReturnsEmpty(string payload)
    {
        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(Api.Latest10VersionsUrl, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json(payload);
        });

        using var client = new HttpClient(handler);
        var service = new ChangelogService(new SingleHttpClientFactory(client), NullLogger<ChangelogService>.Instance);

        var changelogEntries = await service.GetChangelogAsync(10);

        Assert.Empty(changelogEntries);
    }

    [Fact]
    public async Task GetChangelogAsync_MapsRealApiFieldNamesForChanges()
    {
        const string payload = """
                               {
                                 "results": [
                                   {
                                     "version_number": "26021013",
                                     "date_created": "2026-02-10",
                                     "changes": [
                                       {
                                         "author_username": "Bod9001",
                                         "description": "You can now load bullets into magazines",
                                         "category": "NEW"
                                       }
                                     ]
                                   }
                                 ]
                               }
                               """;

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(Api.Latest10VersionsUrl, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json(payload);
        });

        using var client = new HttpClient(handler);
        var service = new ChangelogService(new SingleHttpClientFactory(client), NullLogger<ChangelogService>.Instance);

        var changelogEntries = await service.GetChangelogAsync(10);

        Assert.Single(changelogEntries);
        Assert.Equal("Bod9001", changelogEntries[0].Changes[0].Author);
        Assert.Equal("NEW", changelogEntries[0].Changes[0].Type);
    }
}
