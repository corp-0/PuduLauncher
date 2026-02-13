using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Game;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("servers")]
public class ServersController(IServerListService serverListService)
{
    [PuduCommand]
    public async Task<List<GameServer>> GetServers()
    {
        return await serverListService.FetchServerListAsync();
    }
}
