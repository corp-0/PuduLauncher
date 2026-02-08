using PuduLauncher.Models.Config;

namespace PuduLauncher.Services.Interfaces;

public interface IPreferencesService
{
    Preferences GetPreferences();
    Task UpdatePreferencesAsync(Preferences preferences);
}