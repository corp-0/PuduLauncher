using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Tts;

/// <summary>
/// Mirrors the honk_tts config.json written by the installer.
/// </summary>
public class TtsManifest
{
    [JsonPropertyName("installerVersion")]
    public string InstallerVersion { get; set; } = "";

    [JsonPropertyName("pythonVersion")]
    public string PythonVersion { get; set; } = "";

    [JsonPropertyName("espeakVersion")]
    public string EspeakVersion { get; set; } = "";

    [JsonPropertyName("ttsModel")]
    public string TtsModel { get; set; } = "";

    [JsonPropertyName("requirementsHash")]
    public string RequirementsHash { get; set; } = "";

    [JsonPropertyName("installedAt")]
    public string InstalledAt { get; set; } = "";

    [JsonPropertyName("updatedAt")]
    public string UpdatedAt { get; set; } = "";

    [JsonPropertyName("installDir")]
    public string InstallDir { get; set; } = "";
}
