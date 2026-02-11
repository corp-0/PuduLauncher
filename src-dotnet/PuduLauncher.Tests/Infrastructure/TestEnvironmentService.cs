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

    public bool ShouldDisableUpdateCheck()
    {
        return currentEnvironment == CurrentEnvironment.LinuxFlatpak;
    }

    public ProcessStartInfo? GetGameProcessStartInfo(string executable, string arguments)
    {
        return null;
    }
}
