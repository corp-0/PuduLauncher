using System.Text.Json;
using PuduLauncher.Models.Config;
using PuduLauncher.Services.Interfaces;

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
    }

    public Preferences GetPreferences()
    {
        if (_preferences != null)
        {
            return _preferences;
        }

        string preferencesJson = File.ReadAllText(_preferencesFilePath);
        _preferences = JsonSerializer.Deserialize(preferencesJson, JsonCtx.Default.Preferences);

        _preferences ??= new();

        if (string.IsNullOrWhiteSpace(_preferences.InstallationPath))
        {
            _preferences.InstallationPath = Path.Combine(_environmentService.GetUserdataDirectory(), "Installations");
        }

        return _preferences;
    }

    public async Task UpdatePreferencesAsync(Preferences preferences)
    {
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

        var defaults = new Preferences
        {
            InstallationPath = Path.Combine(_environmentService.GetUserdataDirectory(), "Installations")
        };

        var json = JsonSerializer.Serialize(defaults, JsonCtx.Default.Preferences);
        File.WriteAllText(_preferencesFilePath, json);

        _logger.LogInformation("Created default preferences file at {Path}", _preferencesFilePath);
    }
}
