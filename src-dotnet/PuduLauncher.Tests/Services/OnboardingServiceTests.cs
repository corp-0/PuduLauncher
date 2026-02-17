using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Onboarding;
using PuduLauncher.Services;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class OnboardingServiceTests
{
    [Fact]
    public void GetPendingSteps_WithFreshState_ReturnsConfiguredDefaultStep()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            var service = CreateService(userdataDirectory);

            List<OnboardingStep> pending = service.GetPendingSteps();

            Assert.Equal(3, pending.Count);
            Assert.Equal("welcome-v1", pending[0].Id);
            Assert.Equal("basic-preferences-v1", pending[1].Id);
            Assert.Equal("ready-v1", pending[2].Id);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task CompleteStepAsync_MarksStepCompletedAndRemovesItFromPending()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            var service = CreateService(userdataDirectory);

            await service.CompleteStepAsync("welcome-v1");

            List<OnboardingStep> pending = service.GetPendingSteps();
            Assert.Equal(2, pending.Count);
            Assert.DoesNotContain(pending, step => step.Id == "welcome-v1");

            OnboardingState persisted = ReadState(GetStatePath(userdataDirectory));
            var stepState = Assert.Single(persisted.Steps);
            Assert.Equal("welcome-v1", stepState.StepId);
            Assert.Equal(OnboardingStepStatus.Completed, stepState.Status);
            Assert.NotNull(stepState.CompletedAtUtc);
            Assert.NotNull(stepState.SeenAtUtc);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task MarkStepSeenAsync_PersistsSeenStatus()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            var service = CreateService(userdataDirectory);

            await service.MarkStepSeenAsync("welcome-v1");

            OnboardingState persisted = ReadState(GetStatePath(userdataDirectory));
            var stepState = Assert.Single(persisted.Steps);
            Assert.Equal("welcome-v1", stepState.StepId);
            Assert.Equal(OnboardingStepStatus.Seen, stepState.Status);
            Assert.NotNull(stepState.SeenAtUtc);
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    [Fact]
    public async Task DismissStepAsync_OnRequiredStep_Throws()
    {
        string userdataDirectory = CreateTempDirectory();

        try
        {
            var service = CreateService(userdataDirectory);

            await Assert.ThrowsAsync<InvalidOperationException>(() => service.DismissStepAsync("welcome-v1"));
        }
        finally
        {
            Directory.Delete(userdataDirectory, recursive: true);
        }
    }

    private static OnboardingService CreateService(string userdataDirectory)
    {
        return new OnboardingService(new TestEnvironmentService(userdataDirectory), NullLogger<OnboardingService>.Instance);
    }

    private static string GetStatePath(string userdataDirectory)
    {
        return Path.Combine(userdataDirectory, "onboarding-state.json");
    }

    private static string CreateTempDirectory()
    {
        string path = Path.Combine(Path.GetTempPath(), $"pudulauncher-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);
        return path;
    }

    private static OnboardingState ReadState(string statePath)
    {
        string json = File.ReadAllText(statePath);
        OnboardingState? deserialized = JsonSerializer.Deserialize(json, PuduLauncher.JsonCtx.Default.OnboardingState);
        Assert.NotNull(deserialized);
        return deserialized;
    }
}
