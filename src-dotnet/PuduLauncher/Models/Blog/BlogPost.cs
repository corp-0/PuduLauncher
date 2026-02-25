using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Blog;

public class BlogPost
{
    public string Title { get; set; } = "Blog post!";
    public string? Slug { get; set; }
    public string? Author { get; set; }
    public DateTime? CreateDateTime { get; set; }

    public string? Type { get; set; }
    public string? ImageUrl { get; set; }

    public string? Summary { get; set; }
    public string? State { get; set; }
    public List<BlogSection>? Sections { get; set; }
}
