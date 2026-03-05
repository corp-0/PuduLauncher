using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Discord;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("discord")]
public class DiscordController(IDiscordJoinService discordJoinService)
{
    [PuduCommand]
    public Task AcceptDiscordJoin(AcceptDiscordJoinRequest request)
        => discordJoinService.AcceptJoinAsync(request);
}
