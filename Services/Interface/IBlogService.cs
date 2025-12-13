using PuduLauncher.Models.Api.Changelog;

namespace PuduLauncher.Services.Interface;

/// <summary>
/// Handles contacting the blog API.
/// </summary>
public interface IBlogService
{
    /// <summary>
    /// Gets the latest <paramref name="count" /> blog posts.
    /// </summary>
    /// <param name="count">Number of posts to retrieve.</param>
    /// <returns>A list of blog posts; empty if unavailable.</returns>
    List<BlogPost> FetchBlogPosts(int count);
}
