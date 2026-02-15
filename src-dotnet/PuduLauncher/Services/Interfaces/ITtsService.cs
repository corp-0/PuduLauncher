using PuduLauncher.Models.Tts;

namespace PuduLauncher.Services.Interfaces;

public interface ITtsService
{
    TtsState GetState();
    Task InstallAsync(CancellationToken ct = default);
    Task UninstallAsync(CancellationToken ct = default);
    Task CheckForUpdatesAsync(CancellationToken ct = default);
    Task StartServerAsync(CancellationToken ct = default);
    Task StopServerAsync(CancellationToken ct = default);
}
