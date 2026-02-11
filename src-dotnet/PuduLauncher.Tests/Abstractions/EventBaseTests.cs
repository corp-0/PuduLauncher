using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;

namespace PuduLauncher.Tests.Abstractions;

public class EventBaseTests
{
    [Fact]
    public void Constructor_WhenPuduEventAttributeExists_SetsEventTypeAndTimestamp()
    {
        DateTimeOffset before = DateTimeOffset.UtcNow;
        var evt = new DecoratedTestEvent();
        DateTimeOffset after = DateTimeOffset.UtcNow;

        Assert.Equal("tests:decorated", evt.EventType);
        Assert.InRange(evt.Timestamp, before, after);
    }

    [Fact]
    public void Constructor_WhenPuduEventAttributeMissing_ThrowsInvalidOperationException()
    {
        var exception = Assert.Throws<InvalidOperationException>(() => new UndecoratedTestEvent());
        Assert.Contains("must be decorated", exception.Message, StringComparison.Ordinal);
    }

    [PuduEvent("tests:decorated")]
    private sealed class DecoratedTestEvent : EventBase;

    private sealed class UndecoratedTestEvent : EventBase;
}
