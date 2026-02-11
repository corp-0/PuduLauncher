using PuduLauncher.Controllers;
using PuduLauncher.Models.Blog;
using PuduLauncher.Models.Changelog;
using PuduLauncher.Models.Config;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Tests.Controllers;

public class ControllerTests
{
    [Fact]
    public async Task BlogController_GetBlogPosts_ForwardsCountAndResult()
    {
        var service = new StubBlogService();
        var controller = new BlogController(service);

        List<BlogPost> result = await controller.GetBlogPosts(5);

        Assert.Equal(5, service.ReceivedCount);
        Assert.Same(service.Posts, result);
    }

    [Fact]
    public async Task ChangelogController_GetChangelog_ForwardsCountAndResult()
    {
        var service = new StubChangelogService();
        var controller = new ChangelogController(service);

        List<ChangelogEntry> result = await controller.GetChangelog(4);

        Assert.Equal(4, service.ReceivedCount);
        Assert.Same(service.Entries, result);
    }

    [Fact]
    public void PreferencesController_GetPreferences_ReturnsServiceResult()
    {
        var service = new StubPreferencesService();
        var controller = new PreferencesController(service);

        Preferences preferences = controller.GetPreferences();

        Assert.Same(service.StoredPreferences, preferences);
    }

    [Fact]
    public void PreferencesController_UpdatePreferences_ForwardsPreferencePayload()
    {
        var service = new StubPreferencesService();
        var controller = new PreferencesController(service);
        var newPreferences = new Preferences();

        controller.UpdatePreferences(newPreferences);

        Assert.Same(newPreferences, service.UpdatedPreferences);
    }

    [Fact]
    public void HealthController_IsPuduAlive_ReturnsExpectedHealthString()
    {
        var controller = new HealthController();

        string message = controller.IsPuduAlive();

        Assert.Equal("If you can read this, then that means I'm not dead", message);
    }

    private sealed class StubBlogService : IBlogService
    {
        public int ReceivedCount { get; private set; }

        public List<BlogPost> Posts { get; } =
        [
            new BlogPost { Title = "One" },
            new BlogPost { Title = "Two" }
        ];

        public Task<List<BlogPost>> GetBlogPostsAsync(int count)
        {
            ReceivedCount = count;
            return Task.FromResult(Posts);
        }
    }

    private sealed class StubChangelogService : IChangelogService
    {
        public int ReceivedCount { get; private set; }

        public List<ChangelogEntry> Entries { get; } =
        [
            new ChangelogEntry { Version = "1.0.0" }
        ];

        public Task<List<ChangelogEntry>> GetChangelogAsync(int count)
        {
            ReceivedCount = count;
            return Task.FromResult(Entries);
        }
    }

    private sealed class StubPreferencesService : IPreferencesService
    {
        public Preferences StoredPreferences { get; } = new();

        public Preferences? UpdatedPreferences { get; private set; }

        public Preferences GetPreferences()
        {
            return StoredPreferences;
        }

        public Task UpdatePreferencesAsync(Preferences preferences)
        {
            UpdatedPreferences = preferences;
            return Task.CompletedTask;
        }
    }
}
