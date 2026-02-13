using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("installations")]
public class InstallationController(IInstallationService installationService)
{
    [PuduCommand]
    public List<Installation> GetInstallations()
    {
        return installationService.GetInstallations();
    }

    [PuduCommand]
    public async Task DeleteInstallation(Guid id)
    {
        await installationService.DeleteInstallationAsync(id);
    }

    [PuduCommand]
    public async Task CleanupOldVersions()
    {
        await installationService.CleanupOldVersionsAsync();
    }

    [PuduCommand]
    public async Task MoveInstallations(string newBasePath)
    {
        await installationService.MoveInstallationsAsync(newBasePath);
    }

    [PuduCommand]
    public bool IsValidInstallationBasePath(string path)
    {
        return installationService.IsValidInstallationBasePath(path);
    }
}
