using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Config;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;
[PuduController("preferences")]
public class PreferencesController(IPreferencesService preferencesService)
{
    [PuduCommand]
    public Preferences GetPreferences()
    {
        return preferencesService.GetPreferences();
    }
    
    [PuduCommand]
    public void UpdatePreferences(Preferences newPrefs)
    {
        _ = preferencesService.UpdatePreferencesAsync(newPrefs);
    }
}