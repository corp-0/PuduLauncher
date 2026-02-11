using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Constants;
using PuduLauncher.Services;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class BlogServiceTests
{
    [Fact]
    public async Task GetBlogPostsAsync_PaginatesDeduplicatesAndStopsWhenCountReached()
    {
        const string secondPage = "https://example.test/blog/page-2?format=json";
        const string thirdPage = "https://example.test/blog/page-3";

        var responses = new Dictionary<string, string>
        {
            [Api.LatestBlogPosts] = """
                                   {
                                     "count": 33,
                                     "next": "https://example.test/blog/page-2?format=json",
                                     "previous": null,
                                     "results": [
                                       { "title": "A", "slug": "progress-33-its-been-a-while", "author": "Gilles", "type": "weekly" },
                                       { "title": "B", "slug": "progress-update-32", "author": "Gilles", "type": "weekly" }
                                     ]
                                   }
                                   """,
            [secondPage] = """
                           {
                             "count": 33,
                             "next": "https://example.test/blog/page-3",
                             "previous": "https://example.test/blog/page-1",
                             "results": [
                               { "title": "B", "slug": "progress-update-32", "author": "Gilles", "type": "weekly" },
                               { "title": "C", "slug": "progress-update-31", "author": "Gilles", "type": "weekly" }
                             ]
                           }
                           """,
            [thirdPage] = """
                          {
                            "count": 33,
                            "next": null,
                            "previous": "https://example.test/blog/page-2",
                            "results": [
                              { "title": "D", "slug": "progress-update-30" }
                            ]
                          }
                          """
        };

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            var requestUri = request.RequestUri?.ToString();
            Assert.NotNull(requestUri);
            Assert.True(responses.TryGetValue(requestUri!, out var payload), $"Unexpected request URI: {requestUri}");

            return DelegateHttpMessageHandler.Json(payload);
        });

        using var client = new HttpClient(handler);
        var service = new BlogService(new SingleHttpClientFactory(client), NullLogger<BlogService>.Instance);

        var posts = await service.GetBlogPostsAsync(3);

        Assert.Equal(3, posts.Count);
        Assert.Equal(posts.Count, posts.Select(post => post.Title).Distinct(StringComparer.Ordinal).Count());
        Assert.Contains(new Uri(Api.LatestBlogPosts), handler.RequestedUris);
        Assert.Contains(new Uri(secondPage), handler.RequestedUris);
        Assert.DoesNotContain(new Uri(thirdPage), handler.RequestedUris);
    }

    [Fact]
    public async Task GetBlogPostsAsync_WhenFirstPageIsNull_ReturnsEmptyWithoutPaging()
    {
        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(Api.LatestBlogPosts, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json("null");
        });

        using var client = new HttpClient(handler);
        var service = new BlogService(new SingleHttpClientFactory(client), NullLogger<BlogService>.Instance);

        var posts = await service.GetBlogPostsAsync(5);

        Assert.Empty(posts);
        Assert.Single(handler.RequestedUris);
        Assert.Equal(Api.LatestBlogPosts, handler.RequestedUris[0].ToString());
    }

    [Fact]
    public async Task GetBlogPostsAsync_WhenNextPageIsNull_ReturnsDataFetchedSoFar()
    {
        const string secondPage = "https://example.test/blog/page-2?format=json";

        var responses = new Dictionary<string, string>
        {
            [Api.LatestBlogPosts] = """
                                   {
                                     "count": 33,
                                     "next": "https://example.test/blog/page-2?format=json",
                                     "results": [
                                       { "title": "A" }
                                     ]
                                   }
                                   """,
            [secondPage] = "null"
        };

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            var requestUri = request.RequestUri?.ToString();
            Assert.NotNull(requestUri);
            Assert.True(responses.TryGetValue(requestUri!, out var payload), $"Unexpected request URI: {requestUri}");
            return DelegateHttpMessageHandler.Json(payload);
        });

        using var client = new HttpClient(handler);
        var service = new BlogService(new SingleHttpClientFactory(client), NullLogger<BlogService>.Instance);

        var posts = await service.GetBlogPostsAsync(5);

        Assert.Single(posts);
        Assert.Equal(2, handler.RequestedUris.Count);
        Assert.Contains(new Uri(Api.LatestBlogPosts), handler.RequestedUris);
        Assert.Contains(new Uri(secondPage), handler.RequestedUris);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetBlogPostsAsync_WhenCountIsZeroOrNegative_DoesNotRequestExtraPages(int count)
    {
        const string secondPage = "https://example.test/blog/page-2?format=json";

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(Api.LatestBlogPosts, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json("""
                                                   {
                                                     "count": 33,
                                                     "next": "https://example.test/blog/page-2?format=json",
                                                     "results": [
                                                       { "title": "A" },
                                                       { "title": "B" }
                                                     ]
                                                   }
                                                   """);
        });

        using var client = new HttpClient(handler);
        var service = new BlogService(new SingleHttpClientFactory(client), NullLogger<BlogService>.Instance);

        var posts = await service.GetBlogPostsAsync(count);

        Assert.Equal(2, posts.Count);
        Assert.DoesNotContain(new Uri(secondPage), handler.RequestedUris);
        Assert.Single(handler.RequestedUris);
    }
}
