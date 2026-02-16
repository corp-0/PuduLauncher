using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Constants;

namespace PuduLauncher.Models.Config;

[PreferenceCategory("Servers")]
public class ServerPreferences
{
    [PreferenceField("Server list API", "text", Tooltip = "Endpoint used to fetch the list of available servers.")]
    public string ServerListApi { get; set; } = Api.ServerListUrl;

    [PreferenceField("Fetch interval (seconds)", "number", Tooltip = "How often the launcher refreshes server data from the API.")]
    public int ServerListFetchIntervalSeconds { get; set; } = 10;
}
