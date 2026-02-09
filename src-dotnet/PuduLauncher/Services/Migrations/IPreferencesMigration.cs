using System.Text.Json.Nodes;

namespace PuduLauncher.Services.Migrations;

public interface IPreferencesMigration
{
    int FromVersion { get; }
    int ToVersion { get; }
    JsonObject Migrate(JsonObject preferences);
}
