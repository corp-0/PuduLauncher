using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using PuduLauncher.Models.ConfigFile;
using PuduLauncher.Services.Interface;

namespace PuduLauncher.Services;

/// <summary>
/// Handles loading, saving, and managing user preferences.
/// </summary>
public class PreferencesService : IPreferencesService, IDisposable
{
    private readonly IEnvironmentService _environmentService;
    private readonly string _preferencesFilePath;
    private readonly SemaphoreSlim _saveLock = new(1, 1);
    private Preferences? _preferences;
    private bool _disposed;

    private JsonSerializerOptions _jsonOptions = new()
    {
        IgnoreReadOnlyProperties = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = true
    };

    public PreferencesService(IEnvironmentService environmentService)
    {
        _environmentService = environmentService;
        _preferencesFilePath = Path.Combine(_environmentService.GetUserdataDirectory(), "prefs.json");
    }

    public Preferences GetPreferences()
    {
        if (_preferences != null)
        {
            return _preferences;
        }

        _preferences = LoadPreferences();
        _preferences.PropertyChanged += OnPreferencesChanged;

        if (string.IsNullOrWhiteSpace(_preferences.InstallationPath))
        {
            _preferences.InstallationPath = Path.Combine(_environmentService.GetUserdataDirectory(), "Installations");
        }

        return _preferences;
    }

    private Preferences LoadPreferences()
    {
        try
        {
            if (File.Exists(_preferencesFilePath))
            {
                string preferencesJson = File.ReadAllText(_preferencesFilePath);
                Preferences? prefs = JsonSerializer.Deserialize<Preferences>(preferencesJson);
                if (prefs != null)
                {
                    return prefs;
                }
            }
        }
        catch
        {
            // If deserialization fails, fall back to defaults and overwrite on next save.
        }

        return new Preferences();
    }

    private void OnPreferencesChanged(object? sender, PropertyChangedEventArgs e)
    {
        _ = SavePreferencesAsync();
    }

    private async Task SavePreferencesAsync()
    {
        Preferences? prefs = _preferences;
        if (prefs == null)
        {
            return;
        }

        string? directory = Path.GetDirectoryName(_preferencesFilePath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        await _saveLock.WaitAsync();
        try
        {
            await using FileStream file = File.Create(_preferencesFilePath);

            await JsonSerializer.SerializeAsync(file, prefs, _jsonOptions);
        }
        finally
        {
            _saveLock.Release();
        }
    }

    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;
        if (_preferences != null)
        {
            _preferences.PropertyChanged -= OnPreferencesChanged;
        }

        _saveLock.Dispose();
    }
}
