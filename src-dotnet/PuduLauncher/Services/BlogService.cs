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
        BlogList blogList = ParseBlogList(blogJson);

        await FetchRemainingPostsAsync(client, blogList, count);

        logger.LogDebug("Fetched {Count} blog posts", blogList.Posts.Count);
        return blogList.Posts;
    }

    private async Task FetchRemainingPostsAsync(HttpClient client, BlogList blogList, int count)
    {
        string? nextPage = blogList.NextPage;
        while (blogList.Posts.Count < count && !string.IsNullOrEmpty(nextPage))
        {
            string nextJson = await client.GetStringAsync(nextPage);
            BlogList tempList = ParseBlogList(nextJson);

            AddPostsFromPage(blogList, tempList, count);

            nextPage = tempList.NextPage;
        }
    }

    private static void AddPostsFromPage(BlogList blogList, BlogList tempList, int count)
    {
        foreach (BlogPost post in tempList.Posts)
        {
            if (blogList.Posts.Exists(x => x.Title.Equals(post.Title, StringComparison.Ordinal)))
                continue;

            blogList.Posts.Add(post);

            if (blogList.Posts.Count >= count)
                break;
        }
    }

    private static BlogList ParseBlogList(string json)
    {
        using JsonDocument document = JsonDocument.Parse(json);
        JsonElement root = document.RootElement;

        var result = new BlogList
        {
            Count = TryGetInt(root, "count"),
            NextPage = TryGetString(root, "next"),
            PreviousPage = TryGetString(root, "previous"),
            Posts = ParsePosts(root),
        };

        return result;
    }

    private static List<BlogPost> ParsePosts(JsonElement root)
    {
        var posts = new List<BlogPost>();

        if (!root.TryGetProperty("results", out JsonElement results) || results.ValueKind != JsonValueKind.Array)
        {
            return posts;
        }

        foreach (JsonElement item in results.EnumerateArray())
        {
            posts.Add(new BlogPost
            {
                Title = TryGetString(item, "title") ?? "Blog post!",
                Slug = TryGetString(item, "slug"),
                Author = TryGetString(item, "author"),
                CreateDateTime = TryGetDateTime(item, "date_created"),
                Type = TryGetString(item, "type"),
                ImageUrl = TryGetString(item, "socials_image"),
                Summary = TryGetString(item, "summary"),
                State = TryGetString(item, "state"),
                Sections = ParseSections(item),
            });
        }

        return posts;
    }

    private static List<BlogSection>? ParseSections(JsonElement post)
    {
        if (!post.TryGetProperty("sections", out JsonElement sections) || sections.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var result = new List<BlogSection>();
        foreach (JsonElement section in sections.EnumerateArray())
        {
            result.Add(new BlogSection
            {
                Heading = TryGetString(section, "heading"),
                Body = TryGetString(section, "body"),
            });
        }

        return result;
    }

    private static string? TryGetString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out JsonElement property))
        {
            return null;
        }

        if (property.ValueKind == JsonValueKind.String)
        {
            return property.GetString();
        }

        return null;
    }

    private static int? TryGetInt(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out JsonElement property))
        {
            return null;
        }

        if (property.ValueKind == JsonValueKind.Number && property.TryGetInt32(out int value))
        {
            return value;
        }

        return null;
    }

    private static DateTime? TryGetDateTime(JsonElement element, string propertyName)
    {
        string? value = TryGetString(element, propertyName);
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateTime.TryParse(value, out DateTime parsed) ? parsed : null;
    }
}
