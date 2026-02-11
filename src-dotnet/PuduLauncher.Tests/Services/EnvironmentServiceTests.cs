using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Enums;
using PuduLauncher.Services;

namespace PuduLauncher.Tests.Services;

public class EnvironmentServiceTests
{
    [Fact]
    public void GetGameProcessStartInfo_UsesExpectedFormatForCurrentEnvironment()
    {
        var service = new EnvironmentService(NullLogger<EnvironmentService>.Instance);
        CurrentEnvironment currentEnvironment = service.GetCurrentEnvironment();

        var processStartInfo = service.GetGameProcessStartInfo("game.exe", "--foo bar");

        Assert.NotNull(processStartInfo);

        switch (currentEnvironment)
        {
            case CurrentEnvironment.WindowsStandalone:
                Assert.Equal("game.exe", processStartInfo!.FileName);
                Assert.Equal("--foo bar", processStartInfo.Arguments);
                break;
            case CurrentEnvironment.MacOsStandalone:
                Assert.Equal("/bin/bash", processStartInfo!.FileName);
                Assert.Contains("open -a 'game.exe' --args --foo bar", processStartInfo.Arguments, StringComparison.Ordinal);
                break;
            case CurrentEnvironment.LinuxStandalone:
            case CurrentEnvironment.LinuxFlatpak:
                Assert.Equal("/bin/bash", processStartInfo!.FileName);
                Assert.Contains("'game.exe' --args --foo bar", processStartInfo.Arguments, StringComparison.Ordinal);
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }
    }

    [Fact]
    public void ShouldDisableUpdateCheck_IsTrueOnlyForFlatpak()
    {
        var service = new EnvironmentService(NullLogger<EnvironmentService>.Instance);
        bool shouldDisableUpdateCheck = service.ShouldDisableUpdateCheck();

        Assert.Equal(service.GetCurrentEnvironment() == CurrentEnvironment.LinuxFlatpak, shouldDisableUpdateCheck);
    }

    [Fact]
    public void GetUserdataDirectory_UsesExpectedBaseForCurrentEnvironment()
    {
        var service = new EnvironmentService(NullLogger<EnvironmentService>.Instance);
        string directory = service.GetUserdataDirectory();

        Assert.False(string.IsNullOrWhiteSpace(directory));

        switch (service.GetCurrentEnvironment())
        {
            case CurrentEnvironment.WindowsStandalone:
                Assert.EndsWith("/PuduLauncher", directory, StringComparison.Ordinal);
                break;
            case CurrentEnvironment.LinuxFlatpak:
                Assert.EndsWith("/.var/app/org.corp0.PuduLauncher", directory, StringComparison.Ordinal);
                break;
            case CurrentEnvironment.MacOsStandalone:
            case CurrentEnvironment.LinuxStandalone:
                Assert.EndsWith("/.local/share/PuduLauncher", directory, StringComparison.Ordinal);
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }
    }
}
