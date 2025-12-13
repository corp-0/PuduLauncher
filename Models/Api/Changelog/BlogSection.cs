using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Api.Changelog;

public class BlogSection
{
    [JsonPropertyName("heading")]
    public string? Heading { get; set; }

    [JsonPropertyName("body")]
    public string? Body { get; set; }
}
