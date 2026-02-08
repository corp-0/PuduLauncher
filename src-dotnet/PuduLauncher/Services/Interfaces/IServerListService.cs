using PuduLauncher.Models.Game;

namespace PuduLauncher.Services.Interfaces;

public interface IServerListService
{
    Task<List<GameServer>> FetchServerListAsync(CancellationToken ct = default);
}
