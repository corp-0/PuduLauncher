using System.Text.Json.Serialization;
using PuduLauncher.Abstractions.Models;
using PuduLauncher.Models.Commands;
using PuduLauncher.Models.Events;

namespace PuduLauncher;

/// <summary>
/// JSON serializer context for Native AOT compilation.
/// All types that need to be serialized/deserialized must be registered here.
/// </summary>
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    WriteIndented = false)]
[JsonSerializable(typeof(string))]
[JsonSerializable(typeof(CommandResult<string>))]
[JsonSerializable(typeof(GreetCommand))]
[JsonSerializable(typeof(TimerEvent))]
[JsonSerializable(typeof(EventBase))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}
