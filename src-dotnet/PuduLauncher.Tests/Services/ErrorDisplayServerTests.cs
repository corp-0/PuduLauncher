using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Models.Events;
using PuduLauncher.Services;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class ErrorDisplayServerTests
{
    [Fact]
    public async Task ShowErrorAsync_PublishesFrontendErrorEvent()
    {
        var eventPublisher = new NoOpEventPublisher { HasConnectedClients = true };
        var service = new ErrorDisplayServer(eventPublisher, NullLogger<ErrorDisplayServer>.Instance);

        await service.ShowErrorAsync(
            source: "tests.show-error",
            userMessage: "Something went wrong",
            code: "TEST_ERROR",
            technicalDetails: "Details");

        var published = Assert.Single(eventPublisher.PublishedEvents);
        var errorEvent = Assert.IsType<FrontendErrorEvent>(published);
        Assert.Equal("error", errorEvent.Severity);
        Assert.Equal("tests.show-error", errorEvent.Source);
        Assert.Equal("TEST_ERROR", errorEvent.Code);
        Assert.Equal("Something went wrong", errorEvent.UserMessage);
        Assert.Equal("Details", errorEvent.TechnicalDetails);
        Assert.True(errorEvent.IsTransient);
    }

    [Fact]
    public async Task ShowErrorAsync_DeduplicatesImmediateDuplicates()
    {
        var eventPublisher = new NoOpEventPublisher { HasConnectedClients = true };
        var service = new ErrorDisplayServer(eventPublisher, NullLogger<ErrorDisplayServer>.Instance);

        await service.ShowErrorAsync(
            source: "tests.dup",
            userMessage: "Duplicate",
            code: "DUPLICATE_ERROR");

        await service.ShowErrorAsync(
            source: "tests.dup",
            userMessage: "Duplicate",
            code: "DUPLICATE_ERROR");

        Assert.Single(eventPublisher.PublishedEvents);
        Assert.Single(service.GetRecentErrors());
    }

    [Fact]
    public async Task ShowFatalAsync_PublishesFatalEvent()
    {
        var eventPublisher = new NoOpEventPublisher { HasConnectedClients = true };
        var service = new ErrorDisplayServer(eventPublisher, NullLogger<ErrorDisplayServer>.Instance);

        await service.ShowFatalAsync(
            source: "tests.fatal",
            userMessage: "Fatal crash",
            code: "FATAL_TEST");

        var published = Assert.Single(eventPublisher.PublishedEvents);
        var errorEvent = Assert.IsType<FrontendErrorEvent>(published);
        Assert.Equal("fatal", errorEvent.Severity);
        Assert.False(errorEvent.IsTransient);
    }

    [Fact]
    public async Task GetRecentErrors_CapsHistoryAtOneHundredEntries()
    {
        var eventPublisher = new NoOpEventPublisher { HasConnectedClients = false };
        var service = new ErrorDisplayServer(eventPublisher, NullLogger<ErrorDisplayServer>.Instance);

        for (int i = 0; i < 110; i++)
        {
            await service.ShowErrorAsync(
                source: "tests.history",
                userMessage: $"Error {i}",
                code: $"CODE_{i}");
        }

        IReadOnlyList<FrontendErrorEvent> history = service.GetRecentErrors();
        Assert.Equal(100, history.Count);
        Assert.Equal("Error 10", history[0].UserMessage);
        Assert.Equal("Error 109", history[^1].UserMessage);
    }
}
