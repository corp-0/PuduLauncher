using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using PuduLauncher.ContentScanning.Infrastructure;
using PuduLauncher.ContentScanning.Models;
using PuduLauncher.ContentScanning.Models.ScanningTypes;
using PuduLauncher.ContentScanning.Scanners;

// psst
// You know ECMA-335 right? The specification for the CLI that .NET runs on?
// Yeah, you need it to understand a lot of this code. So get a copy.
// You know the cool thing?
// ISO has a version that has correct PDF metadata so there's an actual table of contents.
// Right here: https://standards.iso.org/ittf/PubliclyAvailableStandards/c058046_ISO_IEC_23271_2012(E).zip

namespace PuduLauncher.ContentScanning;

/// <summary>
///     Manages the type white/black list of types and namespaces, and verifies assemblies against them.
/// </summary>
public sealed class AssemblyTypeCheckerService
{
    /// <summary>
    ///     Check the assembly for any illegal types. Any types not on the white list
    ///     will cause the assembly to be rejected.
    /// </summary>
    /// <param name="diskPath">Path to the assembly DLL file.</param>
    /// <param name="managedPath">Directory containing managed assemblies for resolution.</param>
    /// <param name="sandboxConfig">The loaded and parsed sandbox configuration.</param>
    /// <param name="otherAssemblies">Names of other assemblies in the same bundle (for multi-assembly references).</param>
    /// <param name="scanLog">Callback for scan progress/error reporting.</param>
    public async Task<bool> CheckAssemblyTypesAsync(
        FileInfo diskPath,
        DirectoryInfo managedPath,
        SandboxConfig sandboxConfig,
        List<string> otherAssemblies,
        Action<ScanLog> scanLog)
    {
        await using FileStream assembly = diskPath.OpenRead();
        Stopwatch fullStopwatch = Stopwatch.StartNew();

        using Resolver resolver = AssemblyTypeCheckerHelpers.CreateResolver(managedPath);
        using PEReader peReader = new(assembly, PEStreamOptions.LeaveOpen);
        MetadataReader reader = peReader.GetMetadataReader();

        string asmName = reader.GetString(reader.GetAssemblyDefinition().Name);

        // Check for native code
        if (peReader.PEHeaders.CorHeader?.ManagedNativeHeaderDirectory is { Size: not 0 })
        {
            scanLog.Invoke(new()
            {
                Type = ScanLog.LogType.Error,
                LogMessage = $"Assembly {asmName} contains native code."
            });

            return false;
        }

        // Verify the IL
        if (ILScanner.IsILValid(asmName, resolver, peReader, reader, scanLog, sandboxConfig) == false)
        {
            scanLog.Invoke(new()
            {
                Type = ScanLog.LogType.Error,
                LogMessage = $"Assembly {asmName} Has invalid IL code"
            });

            return false;
        }

        ConcurrentBag<SandboxError> errors = new();

        // Load all the references
        List<MTypeReferenced> types = reader.GetReferencedTypes(errors);
        List<MMemberRef> members = reader.GetReferencedMembers(errors);
        List<(MType type, MType parent, ArraySegment<MType> interfaceImpls)> inherited = reader.GetExternalInheritedTypes(errors);

        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"References loaded... {fullStopwatch.ElapsedMilliseconds}ms"
        });

        sandboxConfig.MultiAssemblyOtherReferences.Clear();
        sandboxConfig.MultiAssemblyOtherReferences.AddRange(otherAssemblies);

        // We still do explicit type reference scanning, even though the actual whitelists work with raw members.
        // This is so that we can simplify handling of generic type specifications during member checking:
        // we won't have to check that any types in their type arguments are whitelisted.
        foreach (MTypeReferenced type in types.Where(type => type.IsTypeAccessAllowed(sandboxConfig, out _) == false))
        {
            errors.Add(new($"Access to type not allowed: {type} asmName {asmName}"));
        }

        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"Types... {fullStopwatch.ElapsedMilliseconds}ms"
        });

        InheritanceScanner.CheckInheritance(sandboxConfig, inherited, errors);
        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"Inheritance... {fullStopwatch.ElapsedMilliseconds}ms"
        });

        UnmanagedMethodScanner.CheckNoUnmanagedMethodDefs(reader, errors);
        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"Unmanaged methods... {fullStopwatch.ElapsedMilliseconds}ms"
        });

        TypeAbuseScanner.CheckNoTypeAbuse(reader, errors);
        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"Type abuse... {fullStopwatch.ElapsedMilliseconds}ms"
        });

        MemberReferenceScanner.CheckMemberReferences(sandboxConfig, members, errors);
        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"Member References... {fullStopwatch.ElapsedMilliseconds}ms"
        });

        errors = new(errors.OrderBy(x => x.Message));

        foreach (SandboxError error in errors)
        {
            scanLog.Invoke(new()
            {
                Type = ScanLog.LogType.Error,
                LogMessage = $"Sandbox violation: {error.Message}"
            });
        }

        scanLog.Invoke(new()
        {
            LogMessage = errors.IsEmpty ? "No sandbox violations." : $"Total violations: {errors.Count}"
        });
        scanLog.Invoke(new()
        {
            LogMessage = $"Checked assembly in {fullStopwatch.ElapsedMilliseconds}ms"
        });

        return errors.IsEmpty;
    }
}
