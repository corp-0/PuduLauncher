using PuduLauncher.Models.Installations;

namespace PuduLauncher.Services.Interfaces;

public interface IInstallationService
{
    List<Installation> GetInstallations();
    Installation? GetInstallation(string forkName, int buildVersion);
    Installation? GetInstallationById(Guid id);
    Task AddInstallationAsync(Installation installation);
    Task DeleteInstallationAsync(Guid id);
    Task CleanupOldVersionsAsync();
    Task MoveInstallationsAsync(string newBasePath);
    bool IsValidInstallationBasePath(string path);
    Task MarkAsPlayedAsync(Guid id);
}
