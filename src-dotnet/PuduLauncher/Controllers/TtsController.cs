using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Tts;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("tts")]
public class TtsController(ITtsService ttsService)
{
    [PuduCommand]
    public TtsState GetStatus()
    {
        return ttsService.GetState();
    }

    [PuduCommand]
    public async Task Install()
    {
        await ttsService.InstallAsync();
    }

    [PuduCommand]
    public async Task Uninstall()
    {
        await ttsService.UninstallAsync();
    }

    [PuduCommand]
    public async Task CheckForUpdates()
    {
        await ttsService.CheckForUpdatesAsync();
    }

    [PuduCommand]
    public async Task StartServer()
    {
        await ttsService.StartServerAsync();
    }

    [PuduCommand]
    public async Task StopServer()
    {
        await ttsService.StopServerAsync();
    }
}
