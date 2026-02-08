namespace PuduLauncher.Services.Interfaces;

public interface IPingService
{
    Task<string> GetPingAsync(string serverIp);
}
