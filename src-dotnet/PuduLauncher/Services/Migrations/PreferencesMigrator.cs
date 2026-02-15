using System.Text.Json;
using System.Text.Json.Nodes;
using PuduLauncher.Models.Config;

namespace PuduLauncher.Services.Migrations;

public static class PreferencesMigrator
{
    private static readonly IPreferencesMigration[] Migrations =
    [
        // new MigrateV1ToV2(),
    ];

    public static (string Json, bool WasMigrated) MigrateToLatest(string rawJson)
    {
        var obj = JsonNode.Parse(rawJson)?.AsObject()
                  ?? throw new InvalidOperationException("Preferences file contains invalid JSON.");

        var currentVersion = DetectVersion(obj);
        var targetVersion = Preferences.CurrentVersion;

        if (currentVersion >= targetVersion)
            return (rawJson, false);

        foreach (var migration in Migrations)
        {
            if (migration.FromVersion == currentVersion)
            {
                obj = migration.Migrate(obj);
                currentVersion = migration.ToVersion;
            }
        }

        if (currentVersion != targetVersion)
        {
            throw new InvalidOperationException(
                $"Migration chain incomplete: reached version {currentVersion}, expected {targetVersion}.");
        }

        var migratedJson = obj.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
        return (migratedJson, true);
    }

    private static int DetectVersion(JsonObject obj)
    {
        if (!obj.TryGetPropertyValue("version", out var versionNode) || versionNode is null)
            return 1;

        if (versionNode.GetValueKind() == JsonValueKind.String)
            return 1;

        if (versionNode.GetValueKind() == JsonValueKind.Number)
            return versionNode.GetValue<int>();

        return 1;
    }
}
