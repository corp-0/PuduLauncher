using System.Text.Json;
using PuduLauncher.Constants;
using PuduLauncher.Models.Blog;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class BlogService(IHttpClientFactory httpClientFactory, ILogger<BlogService> logger) : IBlogService
{
    public async Task<List<BlogPost>> GetBlogPostsAsync(int count)
    {
        using HttpClient client = httpClientFactory.CreateClient();

        string blogJson = await client.GetStringAsync(Api.LatestBlogPosts);
        BlogList blogList = JsonSerializer.Deserialize(blogJson, JsonCtx.Default.BlogList) ?? new();

        string? nextPage = blogList.NextPage;
        while (blogList.Posts.Count < count && !string.IsNullOrEmpty(nextPage))
        {
            string nextJson = await client.GetStringAsync(nextPage);
            BlogList? tempList = JsonSerializer.Deserialize(nextJson, JsonCtx.Default.BlogList);
            if (tempList is null) break;

            foreach (BlogPost post in tempList.Posts)
            {
                if (blogList.Posts.Exists(x => x.Title.Equals(post.Title, StringComparison.Ordinal)))
                    continue;

                blogList.Posts.Add(post);

                if (blogList.Posts.Count >= count)
                    break;
            }

            nextPage = tempList.NextPage;
        }

        logger.LogDebug("Fetched {Count} blog posts", blogList.Posts.Count);
        return blogList.Posts;
    }
}
