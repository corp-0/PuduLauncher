using System.Text.Json;
using System.Text.Json.Nodes;
using PuduLauncher.Models.Config;
using PuduLauncher.Services.Migrations;

namespace PuduLauncher.Tests.Services.Migrations;

public class PreferencesMigratorTests
{
    [Fact]
    public void MigrateToLatest_WhenPreferencesAlreadyCurrent_ReturnsInputAsIs()
    {
        string rawJson = """
                         {
                           "version": 2,
                           "launcher": {},
                           "servers": {},
                           "installations": {}
                         }
                         """;

        var (json, wasMigrated) = PreferencesMigrator.MigrateToLatest(rawJson);

        Assert.False(wasMigrated);
        Assert.Equal(rawJson, json);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("""{"version":"2"}""")]
    public void MigrateToLatest_WhenPreferencesAreTreatedAsCurrent_DoesNotMigrate(string rawJson)
    {
        var (json, wasMigrated) = PreferencesMigrator.MigrateToLatest(rawJson);

        Assert.False(wasMigrated);
        Assert.Equal(rawJson, json);
    }

    [Fact]
    public void MigrateToLatest_WhenJsonIsInvalid_ThrowsJsonException()
    {
        Assert.ThrowsAny<JsonException>(() => PreferencesMigrator.MigrateToLatest("not-json"));
    }
}

public class MigrateV1ToV2Tests
{
    [Fact]
    public void Migrate_MovesLegacyFieldsIntoCategoryObjects()
    {
        JsonObject prefs = JsonNode.Parse("""
                                          {
                                            "version": 1,
                                            "isTtsEnabled": false,
                                            "ignoreVersionUpdate": 7,
                                            "serverListApi": "https://example.test/servers",
                                            "serverListFetchIntervalSeconds": 15,
                                            "autoRemove": true,
                                            "installationPath": "D:/Games/Unitystation"
                                          }
                                          """)!.AsObject();

        var migration = new MigrateV1ToV2();

        JsonObject migrated = migration.Migrate(prefs);

        Assert.Equal(2, migrated["version"]!.GetValue<int>());
        Assert.False(migrated["launcher"]!["isTtsEnabled"]!.GetValue<bool>());
        Assert.Equal(7, migrated["launcher"]!["ignoreVersionUpdate"]!.GetValue<int>());
        Assert.Equal("https://example.test/servers", migrated["servers"]!["serverListApi"]!.GetValue<string>());
        Assert.Equal(15, migrated["servers"]!["serverListFetchIntervalSeconds"]!.GetValue<int>());
        Assert.True(migrated["installations"]!["autoRemove"]!.GetValue<bool>());
        Assert.Equal("D:/Games/Unitystation", migrated["installations"]!["installationPath"]!.GetValue<string>());
    }

    [Fact]
    public void Migrate_WhenFieldsAreMissing_UsesDefaults()
    {
        JsonObject prefs = JsonNode.Parse("""{"version":1}""")!.AsObject();
        var migration = new MigrateV1ToV2();

        JsonObject migrated = migration.Migrate(prefs);

        Assert.Equal(2, migrated["version"]!.GetValue<int>());
        Assert.True(migrated["launcher"]!["isTtsEnabled"]!.GetValue<bool>());
        Assert.Equal(0, migrated["launcher"]!["ignoreVersionUpdate"]!.GetValue<int>());
        Assert.Equal(string.Empty, migrated["servers"]!["serverListApi"]!.GetValue<string>());
        Assert.Equal(10, migrated["servers"]!["serverListFetchIntervalSeconds"]!.GetValue<int>());
        Assert.False(migrated["installations"]!["autoRemove"]!.GetValue<bool>());
        Assert.Equal(string.Empty, migrated["installations"]!["installationPath"]!.GetValue<string>());
    }
}
