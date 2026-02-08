using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Text.RegularExpressions;
using PuduLauncher.Models.Enums;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public partial class PingService(IEnvironmentService environmentService, ILogger<PingService> logger) : IPingService
{
    public async Task<string> GetPingAsync(string serverIp)
    {
        if (Uri.CheckHostName(serverIp) != UriHostNameType.Dns && !IPAddress.TryParse(serverIp, out _))
        {
            logger.LogError("Server has an invalid ip address '{ServerIp}', skipping ping", serverIp);
            return "Bad IP";
        }

        if (environmentService.GetCurrentEnvironment() == CurrentEnvironment.LinuxFlatpak)
        {
            return await FlatpakGetPingTime(serverIp);
        }

        try
        {
            using Ping ping = new();
            PingReply reply = await ping.SendPingAsync(serverIp, 1000);
            return $"{reply.RoundtripTime}ms";
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error pinging server '{ServerIp}'", serverIp);
            return "Error";
        }
    }

    private async Task<string> FlatpakGetPingTime(string serverIp)
    {
        using Process pingSender = new()
        {
            StartInfo = new()
            {
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                FileName = "ping",
                Arguments = $"{serverIp} -c 1"
            }
        };

        pingSender.Start();
        await pingSender.WaitForExitAsync();

        StreamReader reader = pingSender.StandardOutput;
        string pingRawOutput = await reader.ReadToEndAsync();
        Match matchedPingOutput = PingTimeRegex().Match(pingRawOutput);
        string pingOut = matchedPingOutput.Groups[1].ToString();
        return $"{pingOut}ms";
    }

    [GeneratedRegex(@"time=(.*?)\ ")]
    private static partial Regex PingTimeRegex();
}
