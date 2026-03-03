using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Tts;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class TtsUpdateChecker(
    ITtsVersionService versionService,
    IEventPublisher eventPublisher,
    ILogger<TtsUpdateChecker> logger) : IDisposable
{
    private readonly PeriodicTimer _timer = new(TimeSpan.FromMinutes(5));

    public string? LatestVersion { get; private set; }

    public bool IsNewerVersionAvailable(string? installedVersion)
    {
        if (LatestVersion is null || installedVersion is null)
        {
            return false;
        }

        if (Version.TryParse(LatestVersion, out Version? latest)
            && Version.TryParse(installedVersion, out Version? installed))
        {
            return latest > installed;
        }

        // Fallback to string inequality if parsing fails
        return LatestVersion != installedVersion;
    }

    public async Task CheckForUpdatesAsync(string? installedVersion, CancellationToken ct = default)
    {
        TtsGitHubRelease release = await versionService.FetchLatestReleaseAsync(ct);
        LatestVersion = NormalizeVersion(release.TagName);
        logger.LogInformation("Latest TTS version: {Version}, installed: {Installed}",
            LatestVersion, installedVersion ?? "none");

        await PublishUpdateAvailableIfNeededAsync(installedVersion);
    }

    public void StartPolling(Func<string?> getInstalledVersion, CancellationToken ct)
    {
        _ = Task.Run(() => PollAsync(getInstalledVersion, ct), ct);
    }

    private async Task PollAsync(Func<string?> getInstalledVersion, CancellationToken ct)
    {
        try
        {
            await TryCheckAsync(getInstalledVersion, ct);

            while (await _timer.WaitForNextTickAsync(ct))
            {
                await TryCheckAsync(getInstalledVersion, ct);
            }
        }
        catch (OperationCanceledException)
        {
            // Shutdown requested
        }
    }

    private async Task TryCheckAsync(Func<string?> getInstalledVersion, CancellationToken ct)
    {
        try
        {
            await CheckForUpdatesAsync(getInstalledVersion(), ct);
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Periodic TTS update check failed");
        }
    }

    private async Task PublishUpdateAvailableIfNeededAsync(string? installedVersion)
    {
        if (!IsNewerVersionAvailable(installedVersion) || installedVersion is null)
        {
            return;
        }

        await eventPublisher.PublishAsync(new TtsUpdateAvailableEvent
        {
            InstalledVersion = installedVersion,
            LatestVersion = LatestVersion!
        });
    }

    private static string NormalizeVersion(string version)
    {
        return version.StartsWith('v') ? version[1..] : version;
    }

    public void Dispose()
    {
        _timer.Dispose();
        GC.SuppressFinalize(this);
    }
}
