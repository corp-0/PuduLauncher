using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Changelog;

public class ChangelogEntry
{
    [JsonPropertyName("version_number")]
    public string Version { get; set; } = string.Empty;

    [JsonPropertyName("date_created")]
    public DateTime DateCreated { get; set; }

    [JsonPropertyName("changes")]
    public List<Change> Changes { get; set; } = [];
}

public class Change
{
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("author_username")]
    public string Author { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public string Type { get; set; } = string.Empty;
}
