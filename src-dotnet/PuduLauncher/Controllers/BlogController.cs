using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Blog;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("blog")]
public class BlogController(IBlogService blogService)
{
    [PuduCommand]
    public async Task<List<BlogPost>> GetBlogPosts(int count = 10)
    {
        return await blogService.GetBlogPostsAsync(count);
    }
}
