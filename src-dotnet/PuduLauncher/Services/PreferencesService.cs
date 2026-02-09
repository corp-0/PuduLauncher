using System.Text.Json;
using PuduLauncher.Models.Config;
using PuduLauncher.Services.Interfaces;
using PuduLauncher.Services.Migrations;

namespace PuduLauncher.Services;

public class PreferencesService : IPreferencesService
{
    private Preferences? _preferences;
    private readonly string _preferencesFilePath;
    private readonly IEnvironmentService _environmentService;
    private readonly ILogger<PreferencesService> _logger;

    public PreferencesService(IEnvironmentService environmentService, ILogger<PreferencesService> logger)
    {
        _environmentService = environmentService;
        _logger = logger;
        _preferencesFilePath = Path.Combine(_environmentService.GetUserdataDirectory(), "prefs.json");
        EnsurePreferencesFileExists();
        MigrateIfNeeded();
    }

    public Preferences GetPreferences()
    {
        if (_preferences != null)
        {
            return _preferences;
        }

        string json = File.ReadAllText(_preferencesFilePath);
        _preferences = JsonSerializer.Deserialize(json, JsonCtx.Default.Preferences);
        _preferences ??= new();

        if (string.IsNullOrWhiteSpace(_preferences.Installations.InstallationPath))
        {
            _preferences.Installations.InstallationPath =
                Path.Combine(_environmentService.GetUserdataDirectory(), "Installations");
        }

        return _preferences;
    }

    private void MigrateIfNeeded()
    {
        string rawJson = File.ReadAllText(_preferencesFilePath);

        var (migratedJson, wasMigrated) = PreferencesMigrator.MigrateToLatest(rawJson);

        if (!wasMigrated) return;

        File.WriteAllText(_preferencesFilePath, migratedJson);
        _logger.LogInformation("Preferences migrated and saved to {Path}", _preferencesFilePath);
    }

    public async Task UpdatePreferencesAsync(Preferences preferences)
    {
        preferences.Version = Preferences.CurrentVersion;
        _preferences = preferences;

        await using FileStream file = File.Create(_preferencesFilePath);
        await JsonSerializer.SerializeAsync(file, _preferences, JsonCtx.Default.Preferences);

        _logger.LogInformation("Preferences saved to {Path}", _preferencesFilePath);
    }

    private void EnsurePreferencesFileExists()
    {
        var directory = Path.GetDirectoryName(_preferencesFilePath);
        if (directory != null)
        {
            Directory.CreateDirectory(directory);
        }

        if (File.Exists(_preferencesFilePath)) return;

        var defaults = new Preferences();
        defaults.Installations.InstallationPath =
            Path.Combine(_environmentService.GetUserdataDirectory(), "Installations");

        var json = JsonSerializer.Serialize(defaults, JsonCtx.Default.Preferences);
        File.WriteAllText(_preferencesFilePath, json);

        _logger.LogInformation("Created default preferences file at {Path}", _preferencesFilePath);
    }
}
