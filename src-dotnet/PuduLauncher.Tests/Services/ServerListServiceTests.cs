using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Config;
using PuduLauncher.Models.Game;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class ServerListServiceTests
{
    [Fact]
    public async Task FetchServerListAsync_PopulatesPingMsAndHandlesPingErrors()
    {
        const string serverListApi = "https://example.test/server-list";

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(serverListApi, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json("""
                                                   {
                                                     "servers": [
                                                       {
                                                         "Passworded": false,
                                                         "ServerName": "Pudu's Peaceful Pastures - Creative Mode",
                                                         "ForkName": "UnityStationDevelop",
                                                         "BuildVersion": 26020614,
                                                         "CurrentMap": "MainStations/GateStation.json",
                                                         "GameMode": "Extended",
                                                         "IngameTime": "11:03:09",
                                                         "RoundTime": "1400",
                                                         "PlayerCount": 0,
                                                         "PlayerCountMax": 100,
                                                         "ServerIP": "1.1.1.1",
                                                         "ServerPort": 7777,
                                                         "WinDownload": "https://unitystationfile.b-cdn.net/UnityStationDevelop/StandaloneWindows64/26020614.zip",
                                                         "OSXDownload": "https://unitystationfile.b-cdn.net/UnityStationDevelop/StandaloneOSX/26020614.zip",
                                                         "LinuxDownload": "https://unitystationfile.b-cdn.net/UnityStationDevelop/StandaloneLinux64/26020614.zip",
                                                         "fps": 98,
                                                         "GoodFileVersion": "0.46.0"
                                                       },
                                                       {
                                                         "Passworded": false,
                                                         "ServerName": "NoIp",
                                                         "ForkName": "UnityStationDevelop",
                                                         "BuildVersion": 26021013,
                                                         "CurrentMap": "MainStations/MiniStation.json",
                                                         "GameMode": "Secret",
                                                         "IngameTime": "a lot",
                                                         "RoundTime": "0",
                                                         "PlayerCount": 0,
                                                         "PlayerCountMax": 45,
                                                         "ServerIP": " ",
                                                         "ServerPort": 7777,
                                                         "fps": 98,
                                                         "GoodFileVersion": "0.46.0"
                                                       },
                                                       {
                                                         "Passworded": false,
                                                         "ServerName": "Throws",
                                                         "ServerIP": "2.2.2.2",
                                                         "ServerPort": 7777
                                                       },
                                                       {
                                                         "Passworded": false,
                                                         "ServerName": "BadFormat",
                                                         "ServerIP": "3.3.3.3",
                                                         "ServerPort": 7777
                                                       }
                                                     ]
                                                   }
                                                   """);
        });

        using var client = new HttpClient(handler);
        var preferencesService = new StubPreferencesService(new Preferences
        {
            Servers = new ServerPreferences
            {
                ServerListApi = serverListApi,
                ServerListFetchIntervalSeconds = 1
            }
        });

        var pingService = new DelegatePingService(serverIp => serverIp switch
        {
            "1.1.1.1" => Task.FromResult("12.6ms"),
            "2.2.2.2" => Task.FromException<string>(new InvalidOperationException("Ping failed")),
            "3.3.3.3" => Task.FromResult("not-a-number"),
            _ => Task.FromResult("0ms")
        });

        var service = new ServerListService(
            new SingleHttpClientFactory(client),
            preferencesService,
            new NoOpErrorDisplayServer(),
            pingService,
            NullLogger<ServerListService>.Instance);

        List<GameServer> servers = await service.FetchServerListAsync();

        Assert.Equal(4, servers.Count);
        Assert.Equal(13, servers[0].PingMs);
        Assert.Equal(0, servers[1].PingMs);
        Assert.Equal(0, servers[2].PingMs);
        Assert.Equal(0, servers[3].PingMs);
        Assert.Equal(new[] { "1.1.1.1", "2.2.2.2", "3.3.3.3" }, pingService.RequestedIps);
    }

    [Fact]
    public async Task FetchServerListAsync_WhenResponseHasNoServers_ReturnsEmptyList()
    {
        const string serverListApi = "https://example.test/server-list";

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(serverListApi, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json("{}");
        });

        using var client = new HttpClient(handler);
        var preferencesService = new StubPreferencesService(new Preferences
        {
            Servers = new ServerPreferences { ServerListApi = serverListApi }
        });
        var pingService = new DelegatePingService(_ => Task.FromResult("1ms"));

        var service = new ServerListService(
            new SingleHttpClientFactory(client),
            preferencesService,
            new NoOpErrorDisplayServer(),
            pingService,
            NullLogger<ServerListService>.Instance);

        List<GameServer> servers = await service.FetchServerListAsync();

        Assert.Empty(servers);
        Assert.Empty(pingService.RequestedIps);
    }

    [Fact]
    public async Task FindServerAsync_MatchesServerByIpAndPort_WithoutPinging()
    {
        const string serverListApi = "https://example.test/server-list";

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(serverListApi, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json("""
                                                   {
                                                     "servers": [
                                                       {
                                                         "ServerName": "Alpha",
                                                         "ForkName": "UnityStationDevelop",
                                                         "BuildVersion": 26021013,
                                                         "ServerIP": "1.1.1.1",
                                                         "ServerPort": 7777
                                                       },
                                                       {
                                                         "ServerName": "Beta",
                                                         "ForkName": "UnityStationDevelop",
                                                         "BuildVersion": 26021013,
                                                         "ServerIP": "1.1.1.1",
                                                         "ServerPort": 8888
                                                       }
                                                     ]
                                                   }
                                                   """);
        });

        using var client = new HttpClient(handler);
        var preferencesService = new StubPreferencesService(new Preferences
        {
            Servers = new ServerPreferences { ServerListApi = serverListApi }
        });
        var pingService = new DelegatePingService(_ => Task.FromResult("1ms"));

        var service = new ServerListService(
            new SingleHttpClientFactory(client),
            preferencesService,
            new NoOpErrorDisplayServer(),
            pingService,
            NullLogger<ServerListService>.Instance);

        GameServer? server = await service.FindServerAsync("1.1.1.1", 7777);

        Assert.NotNull(server);
        Assert.Equal("Alpha", server.ServerName);
        Assert.Empty(pingService.RequestedIps);
    }

    [Fact]
    public async Task FindServerAsync_WhenPortMissing_MatchesByIp_WithoutPinging()
    {
        const string serverListApi = "https://example.test/server-list";

        var handler = new DelegateHttpMessageHandler((request, _) =>
        {
            Assert.Equal(serverListApi, request.RequestUri?.ToString());
            return DelegateHttpMessageHandler.Json("""
                                                   {
                                                     "servers": [
                                                       {
                                                         "ServerName": "FirstMatch",
                                                         "ServerIP": "1.1.1.1",
                                                         "ServerPort": 7777
                                                       },
                                                       {
                                                         "ServerName": "SecondMatch",
                                                         "ServerIP": "1.1.1.1",
                                                         "ServerPort": 8888
                                                       }
                                                     ]
                                                   }
                                                   """);
        });

        using var client = new HttpClient(handler);
        var preferencesService = new StubPreferencesService(new Preferences
        {
            Servers = new ServerPreferences { ServerListApi = serverListApi }
        });
        var pingService = new DelegatePingService(_ => Task.FromResult("1ms"));

        var service = new ServerListService(
            new SingleHttpClientFactory(client),
            preferencesService,
            new NoOpErrorDisplayServer(),
            pingService,
            NullLogger<ServerListService>.Instance);

        GameServer? server = await service.FindServerAsync(" 1.1.1.1 ", null);

        Assert.NotNull(server);
        Assert.Equal("FirstMatch", server.ServerName);
        Assert.Empty(pingService.RequestedIps);
    }

    private sealed class StubPreferencesService(Preferences preferences) : IPreferencesService
    {
        private Preferences _preferences = preferences;

        public Preferences GetPreferences()
        {
            return _preferences;
        }

        public Task UpdatePreferencesAsync(Preferences preferences)
        {
            _preferences = preferences;
            return Task.CompletedTask;
        }
    }

    private sealed class DelegatePingService(Func<string, Task<string>> handler) : IPingService
    {
        private readonly Func<string, Task<string>> _handler = handler;

        public List<string> RequestedIps { get; } = [];

        public async Task<string> GetPingAsync(string serverIp)
        {
            RequestedIps.Add(serverIp);
            return await _handler(serverIp);
        }
    }
}
