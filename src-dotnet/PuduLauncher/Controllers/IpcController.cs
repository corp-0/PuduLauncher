using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("ipc")]
public class IpcController(IIpcService ipcService)
{
    [PuduCommand]
    public void RespondToRequest(Guid requestId, bool allowed)
    {
        ipcService.RespondToRequest(requestId, allowed);
    }
}
