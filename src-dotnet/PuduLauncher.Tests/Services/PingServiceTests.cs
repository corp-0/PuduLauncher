using Microsoft.Extensions.Logging.Abstractions;
using PuduLauncher.Services;
using PuduLauncher.Tests.Infrastructure;

namespace PuduLauncher.Tests.Services;

public class PingServiceTests
{
    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("not a host")]
    [InlineData("bad://host")]
    public async Task GetPingAsync_WhenServerIpIsInvalid_ReturnsBadIp(string serverIp)
    {
        var service = new PingService(
            new TestEnvironmentService(Path.GetTempPath()),
            NullLogger<PingService>.Instance);

        string result = await service.GetPingAsync(serverIp);

        Assert.Equal("Bad IP", result);
    }
}
