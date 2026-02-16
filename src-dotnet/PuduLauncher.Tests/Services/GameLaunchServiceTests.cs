using Microsoft.Extensions.Logging;
using PuduLauncher.Models.Installations;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class GameLaunchServiceTests
{
    [Fact]
    public async Task LaunchGameAsync_WhenExecutableIsMissing_LogsError()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            string installPath = Path.Combine(userdataDirectory, "Installations", "fork-a", "1");
            Directory.CreateDirectory(installPath);

            var installation = new Installation
            {
                Id = Guid.NewGuid(),
                ForkName = "fork-a",
                BuildVersion = 1,
                InstallationPath = installPath,
                LastPlayedDate = DateTime.UtcNow
            };

            var installationService = new FakeInstallationService(installation);
            var logger = new ListLogger<GameLaunchService>();

            var service = new GameLaunchService(
                installationService,
                new TestEnvironmentService(userdataDirectory),
                new NoOpEventPublisher(),
                new NoOpDiscordPresenceService(),
                logger);

            InvalidOperationException ex = await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.LaunchGameAsync(installation.Id));

            Assert.Contains("Could not find executable", ex.Message, StringComparison.Ordinal);
            Assert.Contains(
                logger.Entries,
                e => e.Level == LogLevel.Error && e.Message.Contains("Failed to launch game", StringComparison.Ordinal));
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    private static string CreateTempDirectory()
    {
        string path = Path.Combine(Path.GetTempPath(), $"pudulauncher-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);
        return path;
    }

    private sealed class NoOpDiscordPresenceService : IDiscordPresenceService
    {
        public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public void SetLauncherState()
        {
        }

        public void SetInServerState(ServerPresenceInfo info)
        {
        }

        public void SetInBuildState(BuildPresenceInfo info)
        {
        }

        public void StartGameSession(GameSessionPresenceInfo info)
        {
        }
    }

    private sealed class FakeInstallationService(Installation installation) : IInstallationService
    {
        private Installation _installation = installation;

        public List<Installation> GetInstallations()
        {
            return [_installation];
        }

        public Installation? GetInstallation(string forkName, int buildVersion)
        {
            return _installation.ForkName == forkName && _installation.BuildVersion == buildVersion
                ? _installation
                : null;
        }

        public Installation? GetInstallationById(Guid id)
        {
            return _installation.Id == id ? _installation : null;
        }

        public Task AddInstallationAsync(Installation installationToAdd)
        {
            _installation = installationToAdd;
            return Task.CompletedTask;
        }

        public Task DeleteInstallationAsync(Guid id)
        {
            return Task.CompletedTask;
        }

        public Task CleanupOldVersionsAsync()
        {
            return Task.CompletedTask;
        }

        public Task MoveInstallationsAsync(string newBasePath)
        {
            return Task.CompletedTask;
        }

        public bool IsValidInstallationBasePath(string path)
        {
            return true;
        }

        public Task MarkAsPlayedAsync(Guid id)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class ListLogger<T> : ILogger<T>
    {
        public List<LogEntry> Entries { get; } = [];

        public IDisposable BeginScope<TState>(TState state) where TState : notnull
        {
            return NoOpScope.Instance;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            return true;
        }

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            Entries.Add(new LogEntry(logLevel, formatter(state, exception), exception));
        }

        public sealed record LogEntry(LogLevel Level, string Message, Exception? Exception);

        private sealed class NoOpScope : IDisposable
        {
            public static readonly NoOpScope Instance = new();

            public void Dispose()
            {
            }
        }
    }
}
