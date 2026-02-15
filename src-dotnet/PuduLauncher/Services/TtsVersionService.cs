using System.Text.Json;
using PuduLauncher.Constants;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Tts;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class TtsVersionService(
    IHttpClientFactory httpClientFactory,
    IEnvironmentService environmentService,
    ILogger<TtsVersionService> logger) : ITtsVersionService
{
    private const string ManifestFileName = "config.json";

    public TtsManifest? LoadManifest(string installPath)
    {
        string manifestPath = Path.Combine(installPath, ManifestFileName);

        if (!File.Exists(manifestPath))
        {
            return null;
        }

        try
        {
            string json = File.ReadAllText(manifestPath);
            var manifest = JsonSerializer.Deserialize(json, TtsJsonCtx.Default.TtsManifest);
            logger.LogInformation("Loaded TTS manifest: version {Version}", manifest?.InstallerVersion);
            return manifest;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to read TTS manifest at {Path}", manifestPath);
            return null;
        }
    }

    public async Task<TtsGitHubRelease> FetchLatestReleaseAsync(CancellationToken ct = default)
    {
        using var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd("PuduLauncher");

        string json = await client.GetStringAsync(Api.TtsGitHubLatestReleaseUrl, ct);
        var release = JsonSerializer.Deserialize(json, TtsJsonCtx.Default.TtsGitHubRelease);

        if (release is null || string.IsNullOrWhiteSpace(release.TagName))
        {
            throw new InvalidOperationException("Failed to parse GitHub release response");
        }

        logger.LogInformation("Fetched latest TTS release: {Version}", release.TagName);
        return release;
    }

    public string GetPlatformAssetName()
    {
        return environmentService.GetCurrentEnvironment() switch
        {
            CurrentEnvironment.WindowsStandalone => "win64.zip",
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak => "lin64.zip",
            CurrentEnvironment.MacOsStandalone => "osx.zip",
            _ => throw new PlatformNotSupportedException("Unsupported platform for TTS")
        };
    }
}
