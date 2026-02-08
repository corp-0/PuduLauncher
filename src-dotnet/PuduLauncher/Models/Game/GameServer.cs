using System.Text.Json.Serialization;

namespace PuduLauncher.Models.Game;

public class GameServer
{
    public string? ServerName { get; set; } 
    public string? ForkName { get; set; }
    public int BuildVersion { get; set; }
    public bool Passworded { get; set; }
    public string? CurrentMap { get; set; }
    public string? GameMode { get; set; }
    public string? InGameTime { get; set; }
    public string? RoundTime { get; set; }
    public int PlayerCount { get; set; }
    public int PlayerCountMax { get; set; }
    public string? ServerIp { get; set; }
    public int ServerPort { get; set; }
    public string? WinDownload { get; set; }
    [JsonPropertyName("OSXDownload")]
    public string? OsxDownload { get; set; }
    public string? LinuxDownload { get; set; }
    [JsonPropertyName("fps")]
    public int Fps { get; set; }
    public string? GoodFileVersion { get; set; }


}