using System.Text.Json;
using PuduLauncher.Models.Discord;

namespace PuduLauncher.Services.Interfaces;

public interface IDiscordJoinService
{
    void SubscribeToJoinEvents();
    Task HandleJoinSecretAsync(string secret);
    Task AcceptJoinAsync(AcceptDiscordJoinRequest request);

    static string? BuildJoinSecret(string? serverIp, int? serverPort, string? forkName, int? buildVersion)
    {
        if (string.IsNullOrWhiteSpace(serverIp)) return null;

        var secret = new DiscordJoinSecret
        {
            Ip = serverIp.Trim(),
            Port = serverPort ?? 0,
            Fork = forkName?.Trim() ?? "",
            Build = buildVersion ?? 0
        };
        return JsonSerializer.Serialize(secret, JsonCtx.Default.DiscordJoinSecret);
    }
}
