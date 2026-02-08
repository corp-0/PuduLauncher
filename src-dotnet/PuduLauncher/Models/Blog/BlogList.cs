using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Blog;

public class BlogList
{
    public int? Count { get; set; }

    [JsonPropertyName("next")]
    public string? NextPage { get; set; }

    [JsonPropertyName("previous")]
    public string? PreviousPage { get; set; }

    [JsonPropertyName("results")]
    public List<BlogPost> Posts { get; set; } = [];
}
