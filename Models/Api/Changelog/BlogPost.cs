using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Api.Changelog;

public class BlogPost
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = "Blog post!";

    [JsonPropertyName("slug")]
    public string? Slug { get; set; }

    [JsonPropertyName("author")]
    public string? Author { get; set; }

    [JsonPropertyName("date_created")]
    public DateTime? CreateDateTime { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("socials_image")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("state")]
    public string? State { get; set; }

    [JsonPropertyName("sections")]
    public List<BlogSection>? Sections { get; set; }
}
