using System.Text.Json.Serialization;
using PuduLauncher.ContentScanning.Models;

namespace PuduLauncher.ContentScanning;

[JsonSourceGenerationOptions(
    AllowTrailingCommas = true,
    UseStringEnumConverter = true)]
[JsonSerializable(typeof(SandboxConfig))]
internal partial class ScanningJsonContext : JsonSerializerContext;
