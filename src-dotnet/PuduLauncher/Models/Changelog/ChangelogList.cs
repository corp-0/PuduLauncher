using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Changelog;

public class ChangelogList
{
    [JsonPropertyName("results")]
    public List<ChangelogEntry> Changes { get; set; } = [];
}
