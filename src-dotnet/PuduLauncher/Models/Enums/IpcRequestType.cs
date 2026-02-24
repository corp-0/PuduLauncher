using System.Collections.Frozen;

namespace PuduLauncher.Models.Enums;

/// <summary>
/// Types of permission requests a running game can send via named pipe.
/// Values match the game client protocol (do not change).
/// </summary>
public enum IpcRequestType
{
    OpenUrl = 1,
    ApiUrl = 2,
    TrustMode = 3,
    MicrophoneAccess = 4,
}

public static class IpcRequestTypeExtensions
{
    /// <summary>
    /// Maps the SCREAMING_SNAKE_CASE wire names sent by the game to enum values.
    /// </summary>
    private static readonly FrozenDictionary<string, IpcRequestType> WireNameMap =
        new Dictionary<string, IpcRequestType>(StringComparer.OrdinalIgnoreCase)
        {
            ["OPEN_URL"] = IpcRequestType.OpenUrl,
            ["API_URL"] = IpcRequestType.ApiUrl,
            ["TRUST_MODE"] = IpcRequestType.TrustMode,
            ["MICROPHONE_ACCESS"] = IpcRequestType.MicrophoneAccess,
        }.ToFrozenDictionary(StringComparer.OrdinalIgnoreCase);

    public static bool TryParseWireName(string wireName, out IpcRequestType result)
        => WireNameMap.TryGetValue(wireName, out result);
}
