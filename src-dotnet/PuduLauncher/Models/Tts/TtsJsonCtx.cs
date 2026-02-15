using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Tts;

/// <summary>
/// Local JSON context for TTS models that are only used internally (not exposed via API).
/// These models interact with external JSON formats (honk_tts config.json, GitHub API).
/// </summary>
[JsonSerializable(typeof(TtsManifest))]
[JsonSerializable(typeof(TtsGitHubRelease))]
internal partial class TtsJsonCtx : JsonSerializerContext
{
}
