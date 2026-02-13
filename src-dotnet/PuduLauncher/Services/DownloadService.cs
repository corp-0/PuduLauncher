using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO.Compression;
using System.Text.Json;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Constants;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class DownloadService(
    IHttpClientFactory httpClientFactory,
    IInstallationService installationService,
    IPreferencesService preferencesService,
    IEnvironmentService environmentService,
    IEventPublisher eventPublisher,
    IScannerService scannerService,
    ILogger<DownloadService> logger) : IDownloadService
{
    private readonly ConcurrentDictionary<string, Download> _downloads = new();
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _cancellationTokens = new();

    public async Task StartDownloadAsync(GameServer server)
    {
        string? downloadUrl = ResolveDownloadUrl(server);
        if (string.IsNullOrWhiteSpace(downloadUrl))
        {
            throw new InvalidOperationException(
                $"No download URL available for platform {environmentService.GetCurrentEnvironment()} " +
                $"on server {server.ServerName}");
        }
        logger.LogInformation("Starting download for {ForkName} v{BuildVersion} from {Url}",
            server.ForkName, server.BuildVersion, downloadUrl);

        string forkName = server.ForkName ?? throw new InvalidOperationException("Server has no fork name");
        int buildVersion = server.BuildVersion;
        string goodFileVersion = server.GoodFileVersion ?? string.Empty;
        string key = DownloadKey(forkName, buildVersion);

        if (_downloads.TryGetValue(key, out Download? existing) &&
            existing.State is DownloadState.InProgress or DownloadState.Extracting or DownloadState.Scanning)
        {
            logger.LogWarning("Download already in progress: {ForkName} v{BuildVersion}", forkName, buildVersion);
            return;
        }

        if (!string.IsNullOrWhiteSpace(goodFileVersion))
        {
            bool isValid = await ValidateGoodFileVersionAsync(goodFileVersion);
            if (!isValid)
            {
                throw new InvalidOperationException(
                    $"Invalid GoodFileVersion: {goodFileVersion} for server {server.ServerName}");
            }
        }

        Installation? existingInstallation = installationService.GetInstallation(forkName, buildVersion);
        if (existingInstallation != null)
        {
            throw new InvalidOperationException(
                $"Installation already exists: {forkName} v{buildVersion}");
        }

        string basePath = preferencesService.GetPreferences().Installations.InstallationPath;
        string sanitizedFork = SanitizePath(forkName);
        string installPath = Path.Combine(basePath, sanitizedFork, buildVersion.ToString());

        var download = new Download
        {
            ForkName = forkName,
            BuildVersion = buildVersion,
            DownloadUrl = downloadUrl,
            GoodFileVersion = goodFileVersion,
            InstallPath = installPath,
            State = DownloadState.InProgress
        };

        var cts = new CancellationTokenSource();
        _downloads[key] = download;
        _cancellationTokens[key] = cts;

        await PublishStateChangedAsync(download);

        _ = Task.Run(() => ExecuteDownloadPipelineAsync(download, cts.Token), cts.Token);
    }

    public Task CancelDownloadAsync(string forkName, int buildVersion)
    {
        string key = DownloadKey(forkName, buildVersion);

        if (_cancellationTokens.TryRemove(key, out CancellationTokenSource? cts))
        {
            cts.Cancel();
            cts.Dispose();
        }

        if (_downloads.TryGetValue(key, out Download? download))
        {
            download.State = DownloadState.Failed;
            download.ErrorMessage = "Download cancelled by user";
        }

        return Task.CompletedTask;
    }

    public Download? GetDownload(string forkName, int buildVersion)
    {
        _downloads.TryGetValue(DownloadKey(forkName, buildVersion), out var download);
        return download;
    }

    public List<Download> GetActiveDownloads()
    {
        return _downloads.Values
            .Where(d => d.State is DownloadState.InProgress or DownloadState.Extracting or DownloadState.Scanning)
            .ToList();
    }

    private async Task ExecuteDownloadPipelineAsync(Download download, CancellationToken ct)
    {
        string key = DownloadKey(download.ForkName, download.BuildVersion);
        string tempZipPath = download.InstallPath + ".zip";

        try
        {
            await DownloadFileAsync(download, tempZipPath, ct);

            download.State = DownloadState.Extracting;
            await PublishStateChangedAsync(download);

            logger.LogInformation("Extracting to {Path}", download.InstallPath);
            Directory.CreateDirectory(download.InstallPath);
            ZipFile.ExtractToDirectory(tempZipPath, download.InstallPath, overwriteFiles: true);

            download.State = DownloadState.Scanning;
            await PublishStateChangedAsync(download);

            bool scanPassed = await scannerService.ScanInstallationAsync(download.InstallPath, download.GoodFileVersion, ct);
            if (!scanPassed)
            {
                download.State = DownloadState.ScanFailed;
                download.ErrorMessage = "Security scan failed — assemblies contain disallowed code";
                await PublishStateChangedAsync(download);

                CleanupDirectory(download.InstallPath);
                return;
            }

            var installation = new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = download.ForkName,
                BuildVersion = download.BuildVersion,
                InstallationPath = download.InstallPath,
                LastPlayedDate = DateTime.UtcNow
            };

            await installationService.AddInstallationAsync(installation);

            download.State = DownloadState.Installed;
            await PublishStateChangedAsync(download);

            logger.LogInformation(
                "Download completed: {ForkName} v{BuildVersion}",
                download.ForkName, download.BuildVersion);
        }
        catch (OperationCanceledException)
        {
            download.State = DownloadState.Failed;
            download.ErrorMessage = "Download cancelled";
            await PublishStateChangedAsync(download);
            CleanupDirectory(download.InstallPath);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Download pipeline failed for {ForkName} v{BuildVersion}",
                download.ForkName, download.BuildVersion);

            download.State = DownloadState.Failed;
            download.ErrorMessage = ex.Message;
            await PublishStateChangedAsync(download);
            CleanupDirectory(download.InstallPath);
        }
        finally
        {
            if (File.Exists(tempZipPath))
            {
                try
                {
                    File.Delete(tempZipPath);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to delete temporary download archive: {Path}", tempZipPath);
                }
            }

            _cancellationTokens.TryRemove(key, out _);
        }
    }

    private async Task DownloadFileAsync(Download download, string tempZipPath, CancellationToken ct)
    {
        using HttpClient client = httpClientFactory.CreateClient();

        using HttpResponseMessage response = await client.GetAsync(
            download.DownloadUrl, HttpCompletionOption.ResponseHeadersRead, ct);

        response.EnsureSuccessStatusCode();

        long totalBytes = response.Content.Headers.ContentLength ?? -1;
        download.Size = totalBytes;

        await using Stream responseStream = await response.Content.ReadAsStreamAsync(ct);
        Directory.CreateDirectory(Path.GetDirectoryName(tempZipPath)!);
        await using FileStream fileStream = File.Create(tempZipPath);

        byte[] buffer = new byte[8192];
        long totalRead = 0;
        var progressStopwatch = Stopwatch.StartNew();

        int bytesRead;
        while ((bytesRead = await responseStream.ReadAsync(buffer, ct)) > 0)
        {
            await fileStream.WriteAsync(buffer.AsMemory(0, bytesRead), ct);
            totalRead += bytesRead;
            download.Downloaded = totalRead;

            if (totalBytes > 0)
            {
                download.Progress = (int)(totalRead * 100 / totalBytes);
            }

            // Throttle progress events to every 250ms
            if (progressStopwatch.ElapsedMilliseconds >= 250)
            {
                await eventPublisher.PublishAsync(new DownloadProgressEvent
                {
                    ForkName = download.ForkName,
                    BuildVersion = download.BuildVersion,
                    Downloaded = totalRead,
                    Size = totalBytes,
                    Progress = download.Progress
                }, ct);

                progressStopwatch.Restart();
            }
        }

        download.Progress = 100;
        await eventPublisher.PublishAsync(new DownloadProgressEvent
        {
            ForkName = download.ForkName,
            BuildVersion = download.BuildVersion,
            Downloaded = totalRead,
            Size = totalBytes,
            Progress = 100
        }, ct);

        logger.LogInformation("Downloaded {Bytes} bytes for {ForkName} v{BuildVersion}",
            totalRead, download.ForkName, download.BuildVersion);
    }

    private async Task<bool> ValidateGoodFileVersionAsync(string goodFileVersion)
    {
        try
        {
            using HttpClient client = httpClientFactory.CreateClient();
            string json = await client.GetStringAsync(Api.AllowedGoodFilesUrl);

            using JsonDocument doc = JsonDocument.Parse(json);
            foreach (JsonElement element in doc.RootElement.EnumerateArray())
            {
                if (element.GetString() == goodFileVersion) return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to validate GoodFileVersion: {Version}", goodFileVersion);
            return false;
        }
    }

    private string? ResolveDownloadUrl(GameServer server)
    {
        return environmentService.GetCurrentEnvironment() switch
        {
            CurrentEnvironment.WindowsStandalone => server.WinDownload,
            CurrentEnvironment.MacOsStandalone => server.OsxDownload,
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak => server.LinuxDownload,
            _ => null
        };
    }

    private static string SanitizePath(string input)
    {
        char[] invalid = Path.GetInvalidFileNameChars();
        return new string(input.Where(c => !invalid.Contains(c)).ToArray());
    }

    private static string DownloadKey(string forkName, int buildVersion)
        => $"{forkName}:{buildVersion}";

    private async Task PublishStateChangedAsync(Download download)
    {
        await eventPublisher.PublishAsync(new DownloadStateChangedEvent
        {
            ForkName = download.ForkName,
            BuildVersion = download.BuildVersion,
            State = download.State,
            ErrorMessage = download.ErrorMessage
        });
    }

    private void CleanupDirectory(string path)
    {
        try
        {
            if (Directory.Exists(path))
            {
                Directory.Delete(path, recursive: true);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to clean up directory: {Path}", path);
        }
    }
}
