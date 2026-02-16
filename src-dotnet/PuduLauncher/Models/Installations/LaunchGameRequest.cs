namespace PuduLauncher.Models.Installations;

public class LaunchGameRequest
{
    public Guid InstallationId { get; set; }
    public string? ServerIp { get; set; }
    public int? ServerPort { get; set; }
    public string? ServerName { get; set; }
    public string? GameMode { get; set; }
    public string? CurrentMap { get; set; }
}
