using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Installations;

public class Installation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ForkName { get; set; } = string.Empty;
    public int BuildVersion { get; set; }
    public string InstallationPath { get; set; } = string.Empty;
    public DateTime LastPlayedDate { get; set; }

    [JsonIgnore]
    public bool RecentlyUsed => (DateTime.UtcNow - LastPlayedDate).TotalDays < 7;
}
