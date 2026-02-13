using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("error-display")]
public class ErrorDisplayController(IErrorDisplayServer errorDisplayServer)
{
    [PuduCommand]
    public List<FrontendErrorEvent> GetRecentErrors()
    {
        return errorDisplayServer.GetRecentErrors().ToList();
    }
}
