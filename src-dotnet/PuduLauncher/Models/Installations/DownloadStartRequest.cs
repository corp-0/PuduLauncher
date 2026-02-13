namespace PuduLauncher.Models.Installations;

public sealed class DownloadStartRequest
{
    public required string ForkName { get; init; }
    public required int BuildVersion { get; init; }
    public required string DownloadUrl { get; init; }
    public required string InstallPath { get; init; }
    public string GoodFileVersion { get; init; } = string.Empty;
}

public sealed class DownloadedInstallation
{
    public required string ForkName { get; init; }
    public required int BuildVersion { get; init; }
    public required string InstallationPath { get; init; }
}
