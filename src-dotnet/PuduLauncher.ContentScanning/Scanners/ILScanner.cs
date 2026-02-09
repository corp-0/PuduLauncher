using System.Collections.Concurrent;
using System.Diagnostics;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using ILVerify;
using PuduLauncher.ContentScanning.Models;

namespace PuduLauncher.ContentScanning.Scanners;

internal static class ILScanner
{
    internal static bool IsILValid(string name, IResolver resolver, PEReader peReader,
        MetadataReader reader, Action<ScanLog> scanLog, SandboxConfig loadedCfg)
    {
        scanLog.Invoke(new()
        {
            LogMessage = $"{name}: Verifying IL..."
        });
        Stopwatch sw = Stopwatch.StartNew();
        ConcurrentBag<VerificationResult> bag = new();

        IlScanning(reader, resolver, peReader, bag);

        bool verifyErrors = false;
        foreach (VerificationResult res in bag)
        {
            bool error = AssemblyTypeCheckerHelpers.CheckVerificationResult(loadedCfg, res, name, reader, scanLog);
            if (error)
            {
                verifyErrors = true;
            }
        }

        scanLog.Invoke(new()
        {
            LogMessage = $"{name}: Verified IL in {sw.Elapsed.TotalMilliseconds}ms"
        });

        if (verifyErrors)
        {
            return false;
        }

        return true;
    }

    private static void IlScanning(MetadataReader reader, IResolver resolver, PEReader peReader, ConcurrentBag<VerificationResult> bag)
    {
        Verifier ver = new(resolver);
        ver.SetSystemModuleName(new(AssemblyNames.SystemAssemblyName));
        foreach (TypeDefinitionHandle definition in reader.TypeDefinitions)
        {
            IEnumerable<VerificationResult> errors = ver.Verify(peReader, definition, verifyMethods: true);
            foreach (VerificationResult error in errors)
            {
                bag.Add(error);
            }
        }
    }
}
