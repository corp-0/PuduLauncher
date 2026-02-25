namespace PuduLauncher.Models.Changelog;

public class ChangelogEntry
{
    public string Version { get; set; } = string.Empty;
    public DateTime DateCreated { get; set; }
    public List<Change> Changes { get; set; } = [];
}

public class Change
{
    public string Description { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
