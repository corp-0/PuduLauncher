using PuduLauncher.Models.Tts;

namespace PuduLauncher.Services.Interfaces;

public interface ITtsVersionService
{
    TtsManifest? LoadManifest(string installPath);
    Task<TtsGitHubRelease> FetchLatestReleaseAsync(CancellationToken ct = default);
    string GetPlatformAssetName();
}
