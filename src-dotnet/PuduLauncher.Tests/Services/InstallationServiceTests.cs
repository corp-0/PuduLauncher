using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Config;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class InstallationServiceTests
{
    [Fact]
    public async Task AddInstallationAsync_WhenAutoRemoveEnabled_RemovesOlderBuildsOfSameFork()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            string installationBasePath = Path.Combine(userdataDirectory, "Installations");
            string oldPath = Path.Combine(installationBasePath, "fork-a", "1");
            string newPath = Path.Combine(installationBasePath, "fork-a", "2");
            string otherForkPath = Path.Combine(installationBasePath, "fork-b", "1");

            Directory.CreateDirectory(oldPath);
            Directory.CreateDirectory(newPath);
            Directory.CreateDirectory(otherForkPath);

            var service = new InstallationService(
                new FakePreferencesService(installationBasePath, autoRemove: true),
                new TestEnvironmentService(userdataDirectory),
                new NoOpEventPublisher(),
                new NoOpErrorDisplayServer(),
                NullLogger<InstallationService>.Instance);

            await service.AddInstallationAsync(new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = "fork-a",
                BuildVersion = 1,
                InstallationPath = oldPath,
                LastPlayedDate = DateTime.UtcNow.AddDays(-30)
            });

            await service.AddInstallationAsync(new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = "fork-b",
                BuildVersion = 1,
                InstallationPath = otherForkPath,
                LastPlayedDate = DateTime.UtcNow.AddDays(-30)
            });

            await service.AddInstallationAsync(new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = "fork-a",
                BuildVersion = 2,
                InstallationPath = newPath,
                LastPlayedDate = DateTime.UtcNow
            });

            List<Installation> currentInstallations = service.GetInstallations();

            Assert.Equal(2, currentInstallations.Count);
            Assert.Contains(currentInstallations, i => i.ForkName == "fork-a" && i.BuildVersion == 2);
            Assert.Contains(currentInstallations, i => i.ForkName == "fork-b" && i.BuildVersion == 1);
            Assert.DoesNotContain(currentInstallations, i => i.ForkName == "fork-a" && i.BuildVersion == 1);
            Assert.False(Directory.Exists(oldPath));
            Assert.True(Directory.Exists(newPath));
            Assert.True(Directory.Exists(otherForkPath));
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    [Fact]
    public void Constructor_RemovesStaleInstallationsAndRegeneratesInstallationsFile()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            string installationBasePath = Path.Combine(userdataDirectory, "Installations");
            string validPath = Path.Combine(installationBasePath, "fork-a", "1");
            string stalePath = Path.Combine(installationBasePath, "fork-b", "2");

            Directory.CreateDirectory(validPath);
            File.WriteAllText(Path.Combine(validPath, "Unitystation.exe"), "test");

            var valid = new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = "fork-a",
                BuildVersion = 1,
                InstallationPath = validPath,
                LastPlayedDate = DateTime.UtcNow
            };

            var stale = new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = "fork-b",
                BuildVersion = 2,
                InstallationPath = stalePath,
                LastPlayedDate = DateTime.UtcNow
            };

            string installationsFilePath = Path.Combine(userdataDirectory, "installations.json");
            File.WriteAllText(
                installationsFilePath,
                JsonSerializer.Serialize(new InstallationList { Installations = [valid, stale] }, JsonCtx.Default.InstallationList));

            var service = new InstallationService(
                new FakePreferencesService(installationBasePath),
                new TestEnvironmentService(userdataDirectory),
                new NoOpEventPublisher(),
                new NoOpErrorDisplayServer(),
                NullLogger<InstallationService>.Instance);

            List<Installation> currentInstallations = service.GetInstallations();

            Assert.Single(currentInstallations);
            Assert.Equal(valid.Id, currentInstallations[0].Id);

            string rewrittenJson = File.ReadAllText(installationsFilePath);
            InstallationList? rewritten = JsonSerializer.Deserialize(rewrittenJson, JsonCtx.Default.InstallationList);

            Assert.NotNull(rewritten);
            Assert.Single(rewritten.Installations);
            Assert.Equal(valid.Id, rewritten.Installations[0].Id);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    private static string CreateTempDirectory()
    {
        string path = Path.Combine(Path.GetTempPath(), $"pudulauncher-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);
        return path;
    }

    private sealed class FakePreferencesService(string installationBasePath, bool autoRemove = false) : IPreferencesService
    {
        private readonly Preferences _preferences = new()
        {
            Installations = new InstallationPreferences
            {
                InstallationPath = installationBasePath,
                AutoRemove = autoRemove
            }
        };

        public Preferences GetPreferences()
        {
            return _preferences;
        }

        public Task UpdatePreferencesAsync(Preferences preferences)
        {
            _preferences.Version = preferences.Version;
            _preferences.Servers = preferences.Servers;
            _preferences.Installations = preferences.Installations;
            _preferences.Tts = preferences.Tts;
            return Task.CompletedTask;
        }
    }
}
