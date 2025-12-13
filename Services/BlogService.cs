using System.Text.Json;
using Grpc.Core;
using PuduLauncher.Grpc;
using PuduLauncher.Services.Interface;
using PuduLauncher.Utilities;
using BlogModel = PuduLauncher.Models.Api.Changelog.BlogPost;
using BlogSectionModel = PuduLauncher.Models.Api.Changelog.BlogSection;
using BlogListModel = PuduLauncher.Models.Api.Changelog.BlogList;
using BlogPostMessage = PuduLauncher.Grpc.BlogPost;
using BlogSectionMessage = PuduLauncher.Grpc.BlogSection;

namespace PuduLauncher.Services;

/// <summary>
/// Service for fetching and providing blog posts via gRPC.
/// </summary>
public class BlogService : Blog.BlogBase, IBlogService
{
    private readonly HttpClient _httpClient;

    public BlogService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    /// <summary>
    /// Fetches blog posts from the API, handling pagination as needed.
    /// </summary>
    /// <param name="count"></param>
    /// <returns></returns>
    public List<BlogModel> FetchBlogPosts(int count)
    {
        HttpResponseMessage response = _httpClient.GetAsync(ApiUrls.LatestBlogPosts).Result;
        string blogJson = response.Content.ReadAsStringAsync().Result;
        BlogListModel blogList = JsonSerializer.Deserialize<BlogListModel>(blogJson) ?? new();

        string? nextPage = blogList.NextPage;
        while (blogList.Posts.Count < count && !string.IsNullOrEmpty(nextPage))
        {
            response = _httpClient.GetAsync(nextPage).Result;
            blogJson = response.Content.ReadAsStringAsync().Result;
            BlogListModel tempList = JsonSerializer.Deserialize<BlogListModel>(blogJson) ?? new();

            foreach (BlogModel post in tempList.Posts)
            {
                if (!blogList.Posts.Any(x => x.Title.Equals(post.Title)))
                {
                    blogList.Posts.Add(post);
                }

                if (blogList.Posts.Count == count)
                {
                    break;
                }

                nextPage = tempList.NextPage;
            }
        }

        return blogList.Posts;
    }

    /// <summary>
    /// gRPC method to get blog posts on the frontend layer.
    /// </summary>
    /// <param name="request"></param>
    /// <param name="context"></param>
    /// <returns></returns>
    public override Task<BlogPostsReply> GetBlogPosts(BlogPostsRequest request, ServerCallContext context)
    {
        int count = request.Count > 0 ? request.Count : 10;
        List<BlogModel> posts = FetchBlogPosts(count);

        BlogPostsReply reply = new();
        foreach (BlogModel post in posts)
        {
            BlogPostMessage protoPost = new()
            {
                Title = post.Title ?? string.Empty,
                Slug = post.Slug ?? string.Empty,
                Author = post.Author ?? string.Empty,
                DateCreated = post.CreateDateTime?.ToString("o") ?? string.Empty,
                Type = post.Type ?? string.Empty,
                ImageUrl = post.ImageUrl ?? string.Empty,
                Summary = post.Summary ?? string.Empty,
                State = post.State ?? string.Empty
            };

            if (post.Sections != null)
            {
                foreach (BlogSectionModel section in post.Sections)
                {
                    protoPost.Sections.Add(new BlogSectionMessage
                    {
                        Heading = section.Heading ?? string.Empty,
                        Body = section.Body ?? string.Empty
                    });
                }
            }

            reply.Posts.Add(protoPost);
        }

        return Task.FromResult(reply);
    }
}
