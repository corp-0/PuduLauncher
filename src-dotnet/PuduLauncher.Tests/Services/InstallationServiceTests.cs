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

    private sealed class FakePreferencesService(string installationBasePath) : IPreferencesService
    {
        private readonly Preferences _preferences = new()
        {
            Installations = new InstallationPreferences
            {
                InstallationPath = installationBasePath,
                AutoRemove = false
            }
        };

        public Preferences GetPreferences()
        {
            return _preferences;
        }

        public Task UpdatePreferencesAsync(Preferences preferences)
        {
            _preferences.Version = preferences.Version;
            _preferences.Launcher = preferences.Launcher;
            _preferences.Servers = preferences.Servers;
            _preferences.Installations = preferences.Installations;
            return Task.CompletedTask;
        }
    }
}
