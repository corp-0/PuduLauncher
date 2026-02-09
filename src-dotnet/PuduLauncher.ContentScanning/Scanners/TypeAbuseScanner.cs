using System.Collections.Concurrent;
using System.Reflection;
using System.Reflection.Metadata;
using PuduLauncher.ContentScanning.Infrastructure;
using PuduLauncher.ContentScanning.Models.ScanningTypes;

namespace PuduLauncher.ContentScanning.Scanners;

internal static class TypeAbuseScanner
{
    internal static void CheckNoTypeAbuse(MetadataReader reader, ConcurrentBag<SandboxError> errors)
    {
        foreach (TypeDefinitionHandle typeDefHandle in reader.TypeDefinitions)
        {
            TypeDefinition typeDef = reader.GetTypeDefinition(typeDefHandle);
            if ((typeDef.Attributes & TypeAttributes.ExplicitLayout) != 0)
            {
                MTypeDefined type = reader.GetTypeFromDefinition(typeDefHandle);

                if (typeDef.GetFields().Count > 0)
                {
                    string err = $"Explicit layout type {type} may not have fields.";
                    errors.Add(new(err));
                }
            }
        }
    }
}
