using PuduLauncher.Models.Blog;

namespace PuduLauncher.Services.Interfaces;

public interface IBlogService
{
    Task<List<BlogPost>> GetBlogPostsAsync(int count);
}
