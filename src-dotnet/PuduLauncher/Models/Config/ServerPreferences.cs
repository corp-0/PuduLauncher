using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Constants;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Servers")]
public class ServerPreferences
{
    [PreferenceField("Server List API", "text")]
    public string ServerListApi { get; set; } = Api.ServerListUrl;

    [PreferenceField("Fetch Interval (seconds)", "number")]
    public int ServerListFetchIntervalSeconds { get; set; } = 10;
}
