using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Commands;

namespace PuduLauncher.Controllers;

/// <summary>
/// Simple greeter controller to demonstrate commands.
/// </summary>
[PuduController("greeter")]
public sealed class GreeterController
{
    private readonly ILogger<GreeterController> _logger;

    public GreeterController(ILogger<GreeterController> logger)
    {
        _logger = logger;
    }

    [PuduCommand("greet")]
    public Task<CommandResult<string>> Greet(GreetCommand command)
    {
        _logger.LogInformation("Greet command invoked for: {Name}", command.Name);

        var message = $"Hello, {command.Name}! You've been greeted from .NET!";
        return Task.FromResult(CommandResult<string>.Ok(message));
    }
}
