using PuduLauncher.Models.Changelog;

namespace PuduLauncher.Services.Interfaces;

public interface IChangelogService
{
    Task<List<ChangelogEntry>> GetChangelogAsync(int count);
}
