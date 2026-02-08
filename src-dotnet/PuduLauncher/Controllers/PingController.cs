using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("ping")]
public class PingController(IPingService pingService)
{
    [PuduCommand]
    public async Task<string> PingServer(string serverIp)
    {
        return await pingService.GetPingAsync(serverIp);
    }
}
