using System.Diagnostics.CodeAnalysis;

namespace PuduLauncher.ContentScanning.Models.ScanningTypes;

internal sealed record MTypeReferenced(MResScope ResolutionScope, string Name, string? Namespace) : MType
{
    public override string ToString()
    {
        if (Namespace == null)
        {
            return $"{ResolutionScope}{Name}";
        }

        return $"{ResolutionScope}{Namespace}.{Name}";
    }

    public override string WhitelistToString()
    {
        if (Namespace == null)
        {
            return Name;
        }

        return $"{Namespace}.{Name}";
    }

    public override bool WhitelistEquals(MType other)
    {
        return other switch
        {
            MTypeParsed p => p.WhitelistEquals(this),
            MTypeReferenced r => r.Namespace == Namespace && r.Name == Name &&
                                  r.ResolutionScope.Equals(ResolutionScope),
            _ => false
        };
    }

    public bool IsTypeAccessAllowed(SandboxConfig sandboxConfig, [NotNullWhen(true)] out TypeConfig? cfg)
    {
        if (Namespace == null)
        {
            bool? isAllowed = IsTypeAccessAllowedForTypeWithNoNamespace(sandboxConfig, out TypeConfig? noNamespaceTypeConfig);
            if (isAllowed.HasValue)
            {
                cfg = isAllowed.Value ? noNamespaceTypeConfig : null;
                return isAllowed.Value;
            }
        }

        // Check if in whitelisted namespaces.
        if (sandboxConfig.WhitelistedNamespaces.Any(whNamespace => Namespace?.StartsWith(whNamespace) ?? false))
        {
            cfg = TypeConfig.DefaultAll;
            return true;
        }

        if (ResolutionScope is MResScopeAssembly resScopeAssembly &&
            sandboxConfig.MultiAssemblyOtherReferences.Contains(resScopeAssembly.Name))
        {
            cfg = TypeConfig.DefaultAll;
            return true;
        }


        if (Namespace == null || sandboxConfig.Types.TryGetValue(Namespace, out Dictionary<string, TypeConfig>? nsDict) == false)
        {
            cfg = null;
            return false;
        }

        return nsDict.TryGetValue(Name, out cfg);
    }

    private bool? IsTypeAccessAllowedForTypeWithNoNamespace(SandboxConfig sandboxConfig, [NotNullWhen(true)] out TypeConfig? cfg)
    {
        if (ResolutionScope is MResScopeType parentType)
        {
            if (parentType.Type is MTypeReferenced parentReferencedType)
            {
                if (parentReferencedType.IsTypeAccessAllowed(sandboxConfig, out TypeConfig? parentCfg) == false)
                {
                    cfg = null;
                    return false;
                }

                if (parentCfg.All)
                {
                    cfg = TypeConfig.DefaultAll;
                    return true;
                }

                if (parentCfg.NestedTypes != null && parentCfg.NestedTypes.TryGetValue(Name, out cfg))
                {
                    return true;
                }

                cfg = null;
                return false;
            }

            if (ResolutionScope is MResScopeAssembly mResScopeAssembly &&
                sandboxConfig.MultiAssemblyOtherReferences.Contains(mResScopeAssembly.Name))
            {
                cfg = TypeConfig.DefaultAll;
                return true;
            }

            cfg = null;
            return false;
        }

        cfg = TypeConfig.DefaultAll;
        return null;
    }
}
