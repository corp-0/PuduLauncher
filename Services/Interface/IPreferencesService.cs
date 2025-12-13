using PuduLauncher.Models.ConfigFile;

namespace PuduLauncher.Services.Interface;

/// <summary>
/// Handles user preferences for the launcher.
/// </summary>
public interface IPreferencesService
{
    /// <summary>
    /// Returns the current preferences. Mutations on the returned object are persisted automatically.
    /// </summary>
    Preferences GetPreferences();
}
