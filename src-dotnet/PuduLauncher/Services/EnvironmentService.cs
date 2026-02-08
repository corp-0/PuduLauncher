using System.Diagnostics;
using System.Runtime.InteropServices;
using PuduLauncher.Models.Enums;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class EnvironmentService: IEnvironmentService
{
    private readonly CurrentEnvironment _currentEnvironment;
    private readonly string _userdataDirectory;
    private readonly ILogger<EnvironmentService> _logger;
    
    public EnvironmentService(ILogger<EnvironmentService> logger)
    {
        _logger = logger;
        
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            _currentEnvironment = CurrentEnvironment.WindowsStandalone;
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            _currentEnvironment = CurrentEnvironment.MacOsStandalone;
        }
        else
        {
            _currentEnvironment = File.Exists("/.flatpak-info")
                ? CurrentEnvironment.LinuxFlatpak
                : CurrentEnvironment.LinuxStandalone;
        }
        
        logger.LogInformation("Environment service initiated with OS detected: {Os}", _currentEnvironment);
        
        _userdataDirectory = _currentEnvironment switch
        {
            CurrentEnvironment.WindowsStandalone =>
                $"{Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData)}/PuduLauncher",
            CurrentEnvironment.LinuxFlatpak =>
                $"{Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)}/.var/app/org.corp0.PuduLauncher",
            _ => $"{Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)}/.local/share/PuduLauncher"
        };
    }
    
    public CurrentEnvironment GetCurrentEnvironment()
    {
        return _currentEnvironment;
    }
    
    public string GetUserdataDirectory()
    {
        return _userdataDirectory;
    }
    
    public bool ShouldDisableUpdateCheck()
    {
        return _currentEnvironment == CurrentEnvironment.LinuxFlatpak;
    }
    
    public ProcessStartInfo? GetGameProcessStartInfo(string executable, string arguments)
    {
        return _currentEnvironment switch
        {
            CurrentEnvironment.WindowsStandalone
                => new ProcessStartInfo(executable, $"{arguments}"),
            CurrentEnvironment.MacOsStandalone
                => new ProcessStartInfo("/bin/bash", $"-c \" open -a '{executable}' --args {arguments}; \""),
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak
                => new ProcessStartInfo("/bin/bash", $"-c \" '{executable}' --args {arguments}; \""),
            _ => null
        };
    }
}