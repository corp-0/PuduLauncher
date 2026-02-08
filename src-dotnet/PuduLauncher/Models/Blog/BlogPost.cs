using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Blog;

public class BlogPost
{
    public string Title { get; set; } = "Blog post!";
    public string? Slug { get; set; }
    public string? Author { get; set; }

    [JsonPropertyName("date_created")]
    public DateTime? CreateDateTime { get; set; }

    public string? Type { get; set; }

    [JsonPropertyName("socials_image")]
    public string? ImageUrl { get; set; }

    public string? Summary { get; set; }
    public string? State { get; set; }
    public List<BlogSection>? Sections { get; set; }
}
