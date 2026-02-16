using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Config;
using PuduLauncher.Services;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class PreferencesServiceTests
{
    [Fact]
    public void GetPreferences_CreatesDefaultPreferencesFile()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            var service = CreateService(userdataDirectory);

            Preferences preferences = service.GetPreferences();
            string preferencesPath = GetPreferencesPath(userdataDirectory);

            Assert.True(File.Exists(preferencesPath));
            Assert.Equal(Preferences.CurrentVersion, preferences.Version);
            Assert.Equal(Path.Combine(userdataDirectory, "Installations"), preferences.Installations.InstallationPath);

            Preferences persisted = ReadPreferences(preferencesPath);
            Assert.Equal(Preferences.CurrentVersion, persisted.Version);
            Assert.Equal(Path.Combine(userdataDirectory, "Installations"), persisted.Installations.InstallationPath);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task UpdatePreferencesAsync_PersistsNewValuesAndVersion()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            var service = CreateService(userdataDirectory);

            var updatedPreferences = new Preferences
            {
                Version = 1,
                Launcher = new LauncherPreferences
                {
                    Theme = "Hotdog Stand"
                },
                Servers = new ServerPreferences
                {
                    ServerListApi = "https://example.test/servers",
                    ServerListFetchIntervalSeconds = 99
                },
                Installations = new InstallationPreferences
                {
                    AutoRemove = true,
                    InstallationPath = "D:/Games/Unitystation"
                }
            };

            await service.UpdatePreferencesAsync(updatedPreferences);

            Preferences persisted = ReadPreferences(GetPreferencesPath(userdataDirectory));

            Assert.Equal(Preferences.CurrentVersion, persisted.Version);
            Assert.Equal("Hotdog Stand", persisted.Launcher.Theme);
            Assert.Equal("https://example.test/servers", persisted.Servers.ServerListApi);
            Assert.Equal(99, persisted.Servers.ServerListFetchIntervalSeconds);
            Assert.True(persisted.Installations.AutoRemove);
            Assert.Equal("D:/Games/Unitystation", persisted.Installations.InstallationPath);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    [Fact]
    public void GetPreferences_WhenInstallationPathIsBlank_UsesDefaultPath()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            string preferencesPath = GetPreferencesPath(userdataDirectory);
            File.WriteAllText(preferencesPath, """
                                            {
                                              "version": 2,
                                              "launcher": {
                                                "isTtsEnabled": true,
                                                "ignoreVersionUpdate": 0
                                              },
                                              "servers": {
                                                "serverListApi": "https://example.test/servers",
                                                "serverListFetchIntervalSeconds": 10
                                              },
                                              "installations": {
                                                "autoRemove": false,
                                                "installationPath": ""
                                              }
                                            }
                                            """);

            var service = CreateService(userdataDirectory);

            Preferences preferences = service.GetPreferences();

            Assert.Equal(Path.Combine(userdataDirectory, "Installations"), preferences.Installations.InstallationPath);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    private static PreferencesService CreateService(string userdataDirectory)
    {
        return new PreferencesService(new TestEnvironmentService(userdataDirectory), NullLogger<PreferencesService>.Instance);
    }

    private static string GetPreferencesPath(string userdataDirectory)
    {
        return Path.Combine(userdataDirectory, "prefs.json");
    }

    private static string CreateTempDirectory()
    {
        string path = Path.Combine(Path.GetTempPath(), $"pudulauncher-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);
        return path;
    }

    private static Preferences ReadPreferences(string preferencesPath)
    {
        string json = File.ReadAllText(preferencesPath);
        Preferences? deserialized = JsonSerializer.Deserialize(json, PuduLauncher.JsonCtx.Default.Preferences);
        Assert.NotNull(deserialized);
        return deserialized;
    }
}
