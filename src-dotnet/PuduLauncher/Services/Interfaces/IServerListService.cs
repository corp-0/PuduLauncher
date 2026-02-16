using PuduLauncher.Models.Game;

namespace PuduLauncher.Services.Interfaces;

public interface IServerListService
{
    Task<List<GameServer>> FetchServerListAsync(CancellationToken ct = default);
    Task<GameServer?> FindServerAsync(string serverIp, int? serverPort = null, CancellationToken ct = default);
}
