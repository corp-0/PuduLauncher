using System.Text.Json;
using PuduLauncher.Constants;
using PuduLauncher.Models.Changelog;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class ChangelogService(IHttpClientFactory httpClientFactory, ILogger<ChangelogService> logger) : IChangelogService
{
    public async Task<List<ChangelogEntry>> GetChangelogAsync(int count)
    {
        using HttpClient client = httpClientFactory.CreateClient();

        string changelogJson = await client.GetStringAsync(Api.Latest10VersionsUrl);
        ChangelogList changelogList = ParseChangelogList(changelogJson);

        logger.LogDebug("Fetched {Count} changelog entries", changelogList.Changes.Count);
        return changelogList.Changes.Take(count).ToList();
    }

    private static ChangelogList ParseChangelogList(string json)
    {
        using JsonDocument document = JsonDocument.Parse(json);
        JsonElement root = document.RootElement;

        return new ChangelogList
        {
            Changes = ParseEntries(root),
        };
    }

    private static List<ChangelogEntry> ParseEntries(JsonElement root)
    {
        var entries = new List<ChangelogEntry>();

        if (!root.TryGetProperty("results", out JsonElement results) || results.ValueKind != JsonValueKind.Array)
        {
            return entries;
        }

        foreach (JsonElement entry in results.EnumerateArray())
        {
            entries.Add(new ChangelogEntry
            {
                Version = TryGetString(entry, "version_number") ?? string.Empty,
                DateCreated = TryGetDateTime(entry, "date_created"),
                Changes = ParseChanges(entry),
            });
        }

        return entries;
    }

    private static List<Change> ParseChanges(JsonElement entry)
    {
        var changes = new List<Change>();

        if (!entry.TryGetProperty("changes", out JsonElement sourceChanges) || sourceChanges.ValueKind != JsonValueKind.Array)
        {
            return changes;
        }

        foreach (JsonElement change in sourceChanges.EnumerateArray())
        {
            changes.Add(new Change
            {
                Description = TryGetString(change, "description") ?? string.Empty,
                Author = TryGetString(change, "author_username") ?? string.Empty,
                Type = TryGetString(change, "category") ?? string.Empty,
            });
        }

        return changes;
    }

    private static string? TryGetString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out JsonElement property))
        {
            return null;
        }

        return property.ValueKind == JsonValueKind.String ? property.GetString() : null;
    }

    private static DateTime TryGetDateTime(JsonElement element, string propertyName)
    {
        string? value = TryGetString(element, propertyName);
        if (string.IsNullOrWhiteSpace(value))
        {
            return DateTime.MinValue;
        }

        return DateTime.TryParse(value, out DateTime parsed) ? parsed : DateTime.MinValue;
    }
}
