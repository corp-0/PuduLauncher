using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("game-launch")]
public class GameLaunchController(IGameLaunchService gameLaunchService)
{
    [PuduCommand]
    public async Task LaunchGame(LaunchGameRequest request)
    {
        await gameLaunchService.LaunchGameAsync(
            request.InstallationId, request.ServerIp, request.ServerPort);
    }
}
