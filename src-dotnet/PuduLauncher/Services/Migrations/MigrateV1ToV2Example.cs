using System.Text.Json.Nodes;

namespace PuduLauncher.Services.Migrations;

public class MigrateV1ToV2 : IPreferencesMigration
{
    public int FromVersion => 1;
    public int ToVersion => 2;

    public JsonObject Migrate(JsonObject prefs)
    {
        var launcher = new JsonObject
        {
            ["isTtsEnabled"] = RemoveOrDefault(prefs, "isTtsEnabled", true),
            ["ignoreVersionUpdate"] = RemoveOrDefault(prefs, "ignoreVersionUpdate", 0)
        };

        var servers = new JsonObject
        {
            ["serverListApi"] = RemoveOrDefault(prefs, "serverListApi", ""),
            ["serverListFetchIntervalSeconds"] = RemoveOrDefault(prefs, "serverListFetchIntervalSeconds", 10)
        };

        var installations = new JsonObject
        {
            ["autoRemove"] = RemoveOrDefault(prefs, "autoRemove", false),
            ["installationPath"] = RemoveOrDefault(prefs, "installationPath", "")
        };

        prefs.Remove("version");

        prefs["version"] = 2;
        prefs["launcher"] = launcher;
        prefs["servers"] = servers;
        prefs["installations"] = installations;

        return prefs;
    }

    /// <summary>
    /// Removes a key from the object and returns its JsonNode (unparented, ready to re-assign).
    /// Falls back to a typed JsonValue if the key is missing.
    /// Avoids JsonNode.GetValue&lt;T&gt;() which is not AOT-safe.
    /// </summary>
    private static JsonNode RemoveOrDefault(JsonObject obj, string key, bool defaultValue)
    {
        if (obj.TryGetPropertyValue(key, out var node) && node is not null)
        {
            obj.Remove(key);
            return node;
        }

        return JsonValue.Create(defaultValue);
    }

    private static JsonNode RemoveOrDefault(JsonObject obj, string key, int defaultValue)
    {
        if (obj.TryGetPropertyValue(key, out var node) && node is not null)
        {
            obj.Remove(key);
            return node;
        }

        return JsonValue.Create(defaultValue);
    }

    private static JsonNode RemoveOrDefault(JsonObject obj, string key, string defaultValue)
    {
        if (obj.TryGetPropertyValue(key, out var node) && node is not null)
        {
            obj.Remove(key);
            return node;
        }

        return JsonValue.Create(defaultValue)!;
    }
}
