using System.Diagnostics;
using PuduLauncher.Models.Enums;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Tests.Infrastructure;

internal sealed class TestEnvironmentService(
    string userdataDirectory,
    CurrentEnvironment currentEnvironment = CurrentEnvironment.WindowsStandalone) : IEnvironmentService
{
    public CurrentEnvironment GetCurrentEnvironment()
    {
        return currentEnvironment;
    }

    public string GetUserdataDirectory()
    {
        return userdataDirectory;
    }

    public string GetCanonicalEnvironment()
    {
        return currentEnvironment switch
        {
            CurrentEnvironment.WindowsStandalone => "StandaloneWindows64",
            CurrentEnvironment.LinuxStandalone or CurrentEnvironment.LinuxFlatpak => "StandaloneLinux64",
            CurrentEnvironment.MacOsStandalone => "StandaloneOSX",
            _ => throw new ArgumentOutOfRangeException(nameof(currentEnvironment), currentEnvironment, null),
        };
    }

    public bool ShouldDisableUpdateCheck()
    {
        return currentEnvironment == CurrentEnvironment.LinuxFlatpak;
    }

    public ProcessStartInfo? GetGameProcessStartInfo(string executable, string arguments)
    {
        return null;
    }
}
