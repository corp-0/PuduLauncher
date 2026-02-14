using System.Globalization;
using System.Text.Json;
using PuduLauncher.Constants;
using PuduLauncher.Extensions;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class InstallationWorkflowService(
    IDownloadService downloadService,
    IInstallationService installationService,
    IPreferencesService preferencesService,
    IEnvironmentService environmentService,
    IHttpClientFactory httpClientFactory,
    ILogger<InstallationWorkflowService> logger) : IInstallationWorkflowService
{
    private const string REGISTRY_FORK_NAME = "UnityStationDevelop";
    

    public async Task StartServerDownloadAsync(GameServer server)
    {
        ArgumentNullException.ThrowIfNull(server);

        string forkName = server.ForkName
                          ?? throw new InvalidOperationException("Server has no fork name");

        string? downloadUrl = ResolveServerDownloadUrl(server);
        if (string.IsNullOrWhiteSpace(downloadUrl))
        {
            throw new InvalidOperationException(
                $"No download URL available for platform {environmentService.GetCurrentEnvironment()} on server {server.ServerName}");
        }

        await StartDownloadAsync(
            forkName,
            server.BuildVersion,
            downloadUrl,
            server.GoodFileVersion ?? string.Empty);
    }

    public async Task StartRegistryDownloadAsync(int buildVersion)
    {
        if (buildVersion <= 0)
        {
            throw new InvalidOperationException("Build version must be greater than 0");
        }

        string buildVersionText = buildVersion.ToString(CultureInfo.InvariantCulture);
        string downloadUrl = BuildRegistryDownloadUrl(buildVersionText);
        await StartDownloadAsync(REGISTRY_FORK_NAME, buildVersion, downloadUrl, string.Empty);
    }

    public async Task<List<RegistryBuild>> ListRegistryBuildsAsync()
    {
        logger.LogInformation("Fetching list of builds from Unitystation's registry");
        HttpClient client = httpClientFactory.CreateClient();
        string data = await client.GetStringAsync(Api.BuildsRegistry);
        return ParseRegistryBuilds(data);
    }

    private async Task StartDownloadAsync(
        string forkName,
        int buildVersion,
        string downloadUrl,
        string goodFileVersion)
    {
        Installation? existingInstallation = installationService.GetInstallation(forkName, buildVersion);
        if (existingInstallation != null)
        {
            throw new InvalidOperationException(
                $"Installation already exists: {forkName} v{buildVersion}");
        }

        string installPath = BuildInstallPath(forkName, buildVersion);
        logger.LogInformation(
            "Queueing installation download: {ForkName} v{BuildVersion} -> {InstallPath}",
            forkName,
            buildVersion,
            installPath);

        var request = new DownloadStartRequest
        {
            ForkName = forkName,
            BuildVersion = buildVersion,
            DownloadUrl = downloadUrl,
            GoodFileVersion = goodFileVersion,
            InstallPath = installPath
        };

        await downloadService.StartDownloadAsync(request, RegisterInstallationAsync);
    }

    private async Task RegisterInstallationAsync(DownloadedInstallation downloadedInstallation, CancellationToken _)
    {
        Installation? existingInstallation = installationService.GetInstallation(
            downloadedInstallation.ForkName,
            downloadedInstallation.BuildVersion);

        if (existingInstallation != null)
        {
            logger.LogWarning(
                "Installation was already registered while download was completing: {ForkName} v{BuildVersion}",
                downloadedInstallation.ForkName,
                downloadedInstallation.BuildVersion);
            return;
        }

        var installation = new Installation
        {
            Id = Guid.NewGuid(),
            ForkName = downloadedInstallation.ForkName,
            BuildVersion = downloadedInstallation.BuildVersion,
            InstallationPath = downloadedInstallation.InstallationPath,
            LastPlayedDate = DateTime.MinValue
        };

        await installationService.AddInstallationAsync(installation);
    }

    private string BuildInstallPath(string forkName, int buildVersion)
    {
        string basePath = preferencesService.GetPreferences().Installations.InstallationPath;
        if (string.IsNullOrWhiteSpace(basePath))
        {
            throw new InvalidOperationException("Installation base path is not configured");
        }

        string sanitizedFork = SanitizePath(forkName);
        if (string.IsNullOrWhiteSpace(sanitizedFork))
        {
            throw new InvalidOperationException(
                $"Fork name '{forkName}' cannot be mapped to a valid installation path");
        }

        return Path.Combine(basePath, sanitizedFork, buildVersion.ToString(CultureInfo.InvariantCulture));
    }

    private string? ResolveServerDownloadUrl(GameServer server)
    {
        return environmentService.GetCurrentEnvironment() switch
        {
            CurrentEnvironment.WindowsStandalone => server.WinDownload,
            CurrentEnvironment.MacOsStandalone => server.OsxDownload,
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak => server.LinuxDownload,
            _ => null
        };
    }

    private string BuildRegistryDownloadUrl(string buildVersion)
    {
        UriBuilder builder = new(Api.CdnBaseUrl) { Port = -1 };
        builder.AppendPathSegments(REGISTRY_FORK_NAME)
            .AppendPathSegments(environmentService.GetCanonicalEnvironment())
            .AppendPathSegments(buildVersion + ".zip");

        return builder.ToString();
    }
    
    private static List<RegistryBuild> ParseRegistryBuilds(string json)
    {
        using JsonDocument doc = JsonDocument.Parse(json);

        JsonElement items = doc.RootElement.ValueKind switch
        {
            JsonValueKind.Array => doc.RootElement,
            JsonValueKind.Object when doc.RootElement.TryGetProperty("results", out JsonElement results) => results,
            _ => throw new JsonException("Expected an array or an object with a 'results' array.")
        };

        var builds = new List<RegistryBuild>(items.GetArrayLength());
        foreach (JsonElement item in items.EnumerateArray())
        {
            // External registry API uses snake_case keys
            string versionNumber = item.GetProperty("version_number").GetString()
                                   ?? throw new JsonException("Missing version_number.");
            string dateCreated = item.GetProperty("date_created").GetString()
                                 ?? throw new JsonException("Missing date_created.");

            builds.Add(new RegistryBuild
            {
                VersionNumber = versionNumber,
                DateCreated = dateCreated,
            });
        }

        return builds;
    }

    private static string SanitizePath(string input)
    {
        char[] invalid = Path.GetInvalidFileNameChars();
        return new string(input.Where(c => !invalid.Contains(c)).ToArray());
    }
}
