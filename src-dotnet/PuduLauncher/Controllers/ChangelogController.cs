using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Changelog;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("changelog")]
public class ChangelogController(IChangelogService changelogService)
{
    [PuduCommand]
    public async Task<List<ChangelogEntry>> GetChangelog(int count = 10)
    {
        return await changelogService.GetChangelogAsync(count);
    }
}
