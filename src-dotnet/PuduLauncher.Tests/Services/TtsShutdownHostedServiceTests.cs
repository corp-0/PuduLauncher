using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Config;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Tests.Services;

public class TtsShutdownHostedServiceTests
{
    [Fact]
    public async Task StopAsync_StopsServerWithConfiguredInstallPath()
    {
        var serverService = new RecordingTtsServerService();
        var preferences = new StubPreferencesService("C:\\tts\\install");
        var service = new TtsShutdownHostedService(
            serverService, preferences, NullLogger<TtsShutdownHostedService>.Instance);

        await service.StopAsync(CancellationToken.None);

        Assert.True(serverService.StopAsyncCalled);
        Assert.Equal("C:\\tts\\install", serverService.LastInstallPath);
    }

    [Fact]
    public async Task StopAsync_WhenStopThrows_DoesNotRethrow()
    {
        var serverService = new RecordingTtsServerService { ThrowOnStop = true };
        var preferences = new StubPreferencesService("/tts/install");
        var service = new TtsShutdownHostedService(
            serverService, preferences, NullLogger<TtsShutdownHostedService>.Instance);

        await service.StopAsync(CancellationToken.None); // must not throw
    }

    private sealed class RecordingTtsServerService : ITtsServerService
    {
        public bool ThrowOnStop { get; init; }
        public bool StopAsyncCalled { get; private set; }
        public string? LastInstallPath { get; private set; }

        public bool IsRunning => false;
        public Task StartAsync(string installPath, CancellationToken ct = default) => Task.CompletedTask;

        public Task StopAsync(string? installPath = null, CancellationToken ct = default)
        {
            StopAsyncCalled = true;
            LastInstallPath = installPath;
            if (ThrowOnStop) throw new InvalidOperationException("boom");
            return Task.CompletedTask;
        }

        public Task WaitForHealthAsync(CancellationToken ct = default) => Task.CompletedTask;
        public void Dispose() { }
    }

    private sealed class StubPreferencesService(string installPath) : IPreferencesService
    {
        private readonly Preferences _preferences = new() { Tts = new TtsPreferences { InstallPath = installPath } };
        public Preferences GetPreferences() => _preferences;
        public Task UpdatePreferencesAsync(Preferences preferences) => Task.CompletedTask;
    }
}
