using PuduLauncher.Constants;

namespace PuduLauncher.Models.Config;

public class Preferences
{
    public string ServerListApi { get; set; } = Api.ServerListUrl;
    public int ServerListFetchIntervalSeconds { get; set; } = 10;
    public string Version { get; set; } = "1.0.0";
    public bool AutoRemove { get; set; }
    public int IgnoreVersionUpdate { get; set; }
    public string InstallationPath { get; set; } = "";
    public bool IsTtsEnabled { get; set; } = true;
}