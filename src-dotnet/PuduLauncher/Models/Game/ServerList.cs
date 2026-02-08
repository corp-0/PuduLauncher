using System.Text.Json.Serialization;
using PuduLauncher.Models.Game;

namespace PuduLauncher.Models;

public class ServerList
{
    [JsonPropertyName("servers")]
    public List<GameServer> Servers { get; set; } = new();
}