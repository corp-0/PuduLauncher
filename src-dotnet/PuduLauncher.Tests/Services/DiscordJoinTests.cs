using System.Text.Json;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Controllers;
using PuduLauncher.Models.Discord;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Events;
using PuduLauncher.Models.Game;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;
using PuduLauncher.Tests.Infrastructure;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace PuduLauncher.Tests.Services;

public class DiscordJoinTests
{
    [Fact]
    public void JoinSecret_RoundTrips_ThroughJsonCtx()
    {
        var secret = new DiscordJoinSecret
        {
            Ip = "123.45.67.89",
            Port = 7777,
            Fork = "Unitystation",
            Build = 1234
        };

        string json = JsonSerializer.Serialize(secret, JsonCtx.Default.DiscordJoinSecret);
        DiscordJoinSecret? deserialized = JsonSerializer.Deserialize(json, JsonCtx.Default.DiscordJoinSecret);

        Assert.NotNull(deserialized);
        Assert.Equal("123.45.67.89", deserialized.Ip);
        Assert.Equal(7777, deserialized.Port);
        Assert.Equal("Unitystation", deserialized.Fork);
        Assert.Equal(1234, deserialized.Build);
    }

    [Fact]
    public void JoinSecret_DeserializesFromHandcraftedJson()
    {
        string json = """{"ip":"1.2.3.4","port":9999,"fork":"TestFork","build":100}""";

        DiscordJoinSecret? secret = JsonSerializer.Deserialize(json, JsonCtx.Default.DiscordJoinSecret);

        Assert.NotNull(secret);
        Assert.Equal("1.2.3.4", secret.Ip);
        Assert.Equal(9999, secret.Port);
        Assert.Equal("TestFork", secret.Fork);
        Assert.Equal(100, secret.Build);
    }

    [Fact]
    public void JoinSecret_MalformedJson_ReturnsNull()
    {
        DiscordJoinSecret? secret = null;
        try
        {
            secret = JsonSerializer.Deserialize("not-json", JsonCtx.Default.DiscordJoinSecret);
        }
        catch (JsonException)
        {
            // Expected
        }

        Assert.Null(secret);
    }

    [Fact]
    public async Task AcceptJoin_ServerFound_BuildInstalled_LaunchesGame()
    {
        var server = CreateTestServer();
        var installation = CreateTestInstallation();
        var gameLaunchService = new FakeGameLaunchService();
        var service = CreateJoinService(
            serverListService: new FakeServerListService(server),
            installationService: new FakeInstallationService(installation),
            gameLaunchService: gameLaunchService);

        await service.AcceptJoinAsync(new AcceptDiscordJoinRequest
        {
            ServerIp = "1.2.3.4",
            ServerPort = 7777
        });

        Assert.True(gameLaunchService.LaunchCalled);
        Assert.Equal(installation.Id, gameLaunchService.LastInstallationId);
        Assert.Equal("1.2.3.4", gameLaunchService.LastServerIp);
        Assert.Equal(7777, gameLaunchService.LastServerPort);
    }

    [Fact]
    public async Task AcceptJoin_ServerFound_BuildNotInstalled_StartsDownload()
    {
        var server = CreateTestServer();
        var workflowService = new FakeInstallationWorkflowService();
        var service = CreateJoinService(
            serverListService: new FakeServerListService(server),
            installationService: new FakeInstallationService(null),
            installationWorkflowService: workflowService);

        await service.AcceptJoinAsync(new AcceptDiscordJoinRequest
        {
            ServerIp = "1.2.3.4",
            ServerPort = 7777
        });

        Assert.True(workflowService.DownloadStarted);
        Assert.Equal("1.2.3.4", workflowService.LastServer?.ServerIp);
    }

    [Fact]
    public async Task AcceptJoin_ServerNotFound_Throws()
    {
        var service = CreateJoinService(
            serverListService: new FakeServerListService(null),
            installationService: new FakeInstallationService(null));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AcceptJoinAsync(new AcceptDiscordJoinRequest
            {
                ServerIp = "1.2.3.4",
                ServerPort = 7777
            }));
    }

    [Fact]
    public async Task Controller_DelegatesToJoinService()
    {
        var fakeJoinService = new FakeDiscordJoinService();
        var controller = new DiscordController(fakeJoinService);

        await controller.AcceptDiscordJoin(new AcceptDiscordJoinRequest
        {
            ServerIp = "1.2.3.4",
            ServerPort = 7777
        });

        Assert.True(fakeJoinService.AcceptJoinCalled);
    }

    [Fact]
    public void DiscordJoinRequestEvent_HasCorrectEventType()
    {
        var evt = new DiscordJoinRequestEvent
        {
            ServerIp = "1.2.3.4",
            ServerPort = 7777,
            ForkName = "Unitystation",
            BuildVersion = 1234,
            Status = DiscordJoinStatus.InstallRequired
        };

        Assert.Equal("discord:join-request", evt.EventType);
    }

    private static GameServer CreateTestServer() => new()
    {
        ServerIp = "1.2.3.4",
        ServerPort = 7777,
        ForkName = "Unitystation",
        BuildVersion = 1234,
        ServerName = "Test Server",
        PlayerCount = 10,
        PlayerCountMax = 40
    };

    private static Installation CreateTestInstallation() => new()
    {
        Id = Guid.NewGuid(),
        ForkName = "Unitystation",
        BuildVersion = 1234,
        InstallationPath = "/tmp/test",
        LastPlayedDate = DateTime.UtcNow
    };

    private static DiscordJoinService CreateJoinService(
        IServerListService? serverListService = null,
        IInstallationService? installationService = null,
        IInstallationWorkflowService? installationWorkflowService = null,
        FakeGameLaunchService? gameLaunchService = null,
        IDownloadService? downloadService = null)
    {
        return new DiscordJoinService(
            serverListService ?? new FakeServerListService(null),
            installationService ?? new FakeInstallationService(null),
            installationWorkflowService ?? new FakeInstallationWorkflowService(),
            gameLaunchService ?? new FakeGameLaunchService(),
            downloadService ?? new FakeDownloadService(),
            new NoOpEventPublisher(),
            new NoOpDiscordPresenceService(),
            new FakeHostApplicationLifetime(),
            NullLogger<DiscordJoinService>.Instance);
    }

    private sealed class NoOpDiscordPresenceService : IDiscordPresenceService
    {
        public event Action<string>? JoinSecretReceived;
        public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;
        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
        public void SetLauncherState() { }
        public void SetInServerState(ServerPresenceInfo info) { }
        public void SetInBuildState(BuildPresenceInfo info) { }
        public void StartGameSession(GameSessionPresenceInfo info) { }
    }

    private sealed class FakeDiscordJoinService : IDiscordJoinService
    {
        public bool AcceptJoinCalled { get; private set; }

        public void SubscribeToJoinEvents() { }
        public Task HandleJoinSecretAsync(string secret) => Task.CompletedTask;

        public Task AcceptJoinAsync(AcceptDiscordJoinRequest request)
        {
            AcceptJoinCalled = true;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeHostApplicationLifetime : IHostApplicationLifetime
    {
        public CancellationToken ApplicationStarted => CancellationToken.None;
        public CancellationToken ApplicationStopping => CancellationToken.None;
        public CancellationToken ApplicationStopped => CancellationToken.None;
        public void StopApplication() { }
    }

    private sealed class FakeServerListService(GameServer? server) : IServerListService
    {
        public Task<List<GameServer>> FetchServerListAsync(CancellationToken ct = default)
            => Task.FromResult<List<GameServer>>(server != null ? [server] : []);

        public Task<GameServer?> FindServerAsync(string serverIp, int? serverPort = null, CancellationToken ct = default)
            => Task.FromResult(server);
    }

    private sealed class FakeInstallationService(Installation? installation) : IInstallationService
    {
        public List<Installation> GetInstallations()
            => installation != null ? [installation] : [];

        public Installation? GetInstallation(string forkName, int buildVersion)
            => installation?.ForkName == forkName && installation.BuildVersion == buildVersion ? installation : null;

        public Installation? GetInstallationById(Guid id)
            => installation?.Id == id ? installation : null;

        public Task AddInstallationAsync(Installation i) => Task.CompletedTask;
        public Task DeleteInstallationAsync(Guid id) => Task.CompletedTask;
        public Task CleanupOldVersionsAsync() => Task.CompletedTask;
        public Task MoveInstallationsAsync(string newBasePath) => Task.CompletedTask;
        public bool IsValidInstallationBasePath(string path) => true;
        public Task MarkAsPlayedAsync(Guid id) => Task.CompletedTask;
    }

    private sealed class FakeGameLaunchService : IGameLaunchService
    {
        public bool LaunchCalled { get; private set; }
        public Guid LastInstallationId { get; private set; }
        public string? LastServerIp { get; private set; }
        public int? LastServerPort { get; private set; }

        public Task LaunchGameAsync(Guid installationId, string? serverIp = null, int? serverPort = null)
        {
            LaunchCalled = true;
            LastInstallationId = installationId;
            LastServerIp = serverIp;
            LastServerPort = serverPort;
            return Task.CompletedTask;
        }

        public bool IsGameRunning(string forkName, int buildVersion) => false;
    }

    private sealed class FakeInstallationWorkflowService : IInstallationWorkflowService
    {
        public bool DownloadStarted { get; private set; }
        public GameServer? LastServer { get; private set; }

        public Task StartServerDownloadAsync(GameServer server)
        {
            DownloadStarted = true;
            LastServer = server;
            return Task.CompletedTask;
        }

        public Task StartRegistryDownloadAsync(int buildVersion) => Task.CompletedTask;
        public Task<List<RegistryBuild>> ListRegistryBuildsAsync() => Task.FromResult<List<RegistryBuild>>([]);
    }

    private sealed class FakeDownloadService : IDownloadService
    {
        public Task StartDownloadAsync(DownloadStartRequest request, Func<DownloadedInstallation, CancellationToken, Task> onInstalledAsync)
            => Task.CompletedTask;

        public Task CancelDownloadAsync(string forkName, int buildVersion) => Task.CompletedTask;
        public Download? GetDownload(string forkName, int buildVersion) => null;
        public List<Download> GetActiveDownloads() => [];
    }
}
