using PuduLauncher.Abstractions.Attributes;

namespace PuduLauncher.Controllers;

[PuduController("health")]
public class HealthController
{
    [PuduCommand]
    // ReSharper disable once MemberCanBeMadeStatic.Global
    public string IsPuduAlive()
    {
        return "If you can read this, then that means I'm not dead";
    }
}