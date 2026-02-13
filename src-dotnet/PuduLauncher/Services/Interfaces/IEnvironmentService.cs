using System.Diagnostics;
using PuduLauncher.Models.Enums;

namespace PuduLauncher.Services.Interfaces;

/// <summary>
/// Handles detecting the runtime environment and environment-specific paths or configuration.
/// </summary>
public interface IEnvironmentService
{
    /// <summary>
    /// Gets the current environment the launcher is running on.
    /// </summary>
    CurrentEnvironment GetCurrentEnvironment();
    
    /// <summary>
    /// Gets the canonical string that represents an environment, based on Unity executables
    /// </summary>
    /// <returns></returns>
    string GetCanonicalEnvironment();

    /// <summary>
    /// Gets the userdata directory for the current environment.
    /// </summary>
    string GetUserdataDirectory();

    /// <summary>
    /// Checks if update checks should be disabled for the current environment.
    /// </summary>
    bool ShouldDisableUpdateCheck();

    /// <summary>
    /// Builds ProcessStartInfo for starting the game executable with arguments.
    /// </summary>
    ProcessStartInfo? GetGameProcessStartInfo(string executable, string arguments);

}