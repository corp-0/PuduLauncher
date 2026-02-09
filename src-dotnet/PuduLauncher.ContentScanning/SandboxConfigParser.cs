using System.Text.Json;
using Pidgin;
using PuduLauncher.ContentScanning.Models;
using Serilog;

namespace PuduLauncher.ContentScanning;

/// <summary>
///     Handles deserialization and post-processing of <see cref="SandboxConfig"/> from JSON.
/// </summary>
public static class SandboxConfigParser
{
    /// <summary>
    ///     Deserialize a <see cref="SandboxConfig"/> from a JSON string and parse all
    ///     method/field whitelist declarations into their structured representations.
    /// </summary>
    public static SandboxConfig LoadFromJson(string json)
    {
        SandboxConfig? data = JsonSerializer.Deserialize(json, ScanningJsonContext.Default.SandboxConfig);

        if (data == null)
        {
            throw new CodeScanningException("Unable to deserialize SandboxConfig from JSON.");
        }

        foreach (KeyValuePair<string, Dictionary<string, TypeConfig>> @namespace in data.Types)
        {
            foreach (KeyValuePair<string, TypeConfig> @class in @namespace.Value)
            {
                ParseTypeConfig(@class.Value);
            }
        }

        return data;
    }

    /// <summary>
    ///     Parse the string-based method/field declarations in a <see cref="TypeConfig"/>
    ///     into their structured <see cref="WhitelistMethodDefine"/> / <see cref="WhitelistFieldDefine"/> arrays.
    /// </summary>
    public static void ParseTypeConfig(TypeConfig cfg)
    {
        if (cfg.Methods != null)
        {
            List<WhitelistMethodDefine> list = new();
            foreach (string m in cfg.Methods)
            {
                try
                {
                    list.Add(Parsers.MethodParser.ParseOrThrow(m));
                }
                catch (ParseException e)
                {
                    Log.Error($"Parse exception for '{m}': {e}");
                }
            }

            cfg.MethodsParsed = list.ToArray();
        }
        else
        {
            cfg.MethodsParsed = Array.Empty<WhitelistMethodDefine>();
        }

        if (cfg.Fields != null)
        {
            List<WhitelistFieldDefine> list = new();
            foreach (string f in cfg.Fields)
            {
                try
                {
                    list.Add(Parsers.FieldParser.ParseOrThrow(f));
                }
                catch (ParseException e)
                {
                    Log.Error($"Parse exception for '{f}': {e}");
                    throw;
                }
            }

            cfg.FieldsParsed = list.ToArray();
        }
        else
        {
            cfg.FieldsParsed = Array.Empty<WhitelistFieldDefine>();
        }

        if (cfg.NestedTypes != null)
        {
            foreach (TypeConfig nested in cfg.NestedTypes.Values)
            {
                ParseTypeConfig(nested);
            }
        }
    }
}
