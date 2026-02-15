using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Tts;

/// <summary>
/// Minimal model for the GitHub releases API response.
/// </summary>
public class TtsGitHubRelease
{
    [JsonPropertyName("tag_name")]
    public string TagName { get; set; } = "";

    [JsonPropertyName("assets")]
    public List<TtsGitHubAsset> Assets { get; set; } = [];
}

public class TtsGitHubAsset
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("browser_download_url")]
    public string BrowserDownloadUrl { get; set; } = "";
}
