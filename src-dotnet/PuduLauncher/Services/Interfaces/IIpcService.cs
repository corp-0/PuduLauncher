namespace PuduLauncher.Services.Interfaces;

public interface IIpcService
{
    void Start();
    void RespondToRequest(Guid requestId, bool allowed);
}
