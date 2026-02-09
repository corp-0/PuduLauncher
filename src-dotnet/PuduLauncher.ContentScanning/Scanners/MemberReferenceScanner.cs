using System.Collections.Concurrent;
using PuduLauncher.ContentScanning.Models;
using PuduLauncher.ContentScanning.Models.ScanningTypes;

namespace PuduLauncher.ContentScanning.Scanners;

internal static class MemberReferenceScanner
{
    internal static void CheckMemberReferences(SandboxConfig sandboxConfig, IEnumerable<MMemberRef> members, ConcurrentBag<SandboxError> errors)
    {
        Parallel.ForEach(members, memberRef =>
        {
            MTypeReferenced? baseTypeReferenced = GetBaseMTypeReferenced(memberRef);

            if (baseTypeReferenced == null)
            {
                return;
            }

            if (baseTypeReferenced.IsTypeAccessAllowed(sandboxConfig, out TypeConfig? typeCfg) == false)
            {
                errors.Add(new($"Access to type not allowed: {baseTypeReferenced}"));
                return;
            }

            if (typeCfg.All)
            {
                return;
            }

            CheckMemberRefType(memberRef, typeCfg, errors);
        });
    }

    private static void CheckMemberRefType(MMemberRef memberRef, TypeConfig typeCfg, ConcurrentBag<SandboxError> errors)
    {
        switch (memberRef)
        {
            case MMemberRefField mMemberRefField
                when typeCfg.FieldsParsed.Any(field => field.Name == mMemberRefField.Name
                                                       && mMemberRefField.FieldType.WhitelistEquals(field.FieldType)):
                return; // Found
            case MMemberRefField mMemberRefField:
                errors.Add(new($"Access to field not allowed: {mMemberRefField}"));
                return;
            case MMemberRefMethod mMemberRefMethod:
                bool safe = IsMMemberRefMethodSafe(mMemberRefMethod, typeCfg);
                if (!safe)
                {
                    errors.Add(new($"Access to method not allowed: {mMemberRefMethod}"));
                }

                return;
            default:
                throw new ArgumentException($"Invalid memberRef type: {memberRef.GetType()}", nameof(memberRef));
        }
    }

    private static bool IsMMemberRefMethodSafe(MMemberRefMethod mMemberRefMethod, TypeConfig typeCfg)
    {
        foreach (WhitelistMethodDefine parsed in typeCfg.MethodsParsed)
        {
            bool paramMismatch = false;
            if (parsed.Name != mMemberRefMethod.Name ||
                !mMemberRefMethod.ReturnType.WhitelistEquals(parsed.ReturnType) ||
                mMemberRefMethod.ParameterTypes.Length != parsed.ParameterTypes.Count ||
                mMemberRefMethod.GenericParameterCount != parsed.GenericParameterCount)
            {
                continue;
            }

            for (int i = 0; i < mMemberRefMethod.ParameterTypes.Length; i++)
            {
                MType a = mMemberRefMethod.ParameterTypes[i];
                MType b = parsed.ParameterTypes[i];

                if (a.WhitelistEquals(b))
                {
                    continue;
                }

                paramMismatch = true;
                break;
            }
            if (!paramMismatch)
            {
                return true; // Found
            }
        }

        return false;
    }

    private static MTypeReferenced? GetBaseMTypeReferenced(MMemberRef memberRef)
    {
        MType baseType = memberRef.ParentType;
        while (baseType is not MTypeReferenced)
        {
            switch (baseType)
            {
                case MTypeGeneric generic:
                    baseType = generic.GenericType;
                    continue;
                case MTypeWackyArray or MTypeDefined:
                    return null;
                default:
                    throw new ArgumentException($"Invalid baseType in memberRef: {baseType.GetType()}", nameof(memberRef));
            }
        }

        return (MTypeReferenced)baseType;
    }
}
