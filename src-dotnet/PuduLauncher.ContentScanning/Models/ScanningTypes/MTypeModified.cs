namespace PuduLauncher.ContentScanning.Models.ScanningTypes;

internal sealed record MTypeModified(MType UnmodifiedType, MType ModifierType, bool Required) : MType
{
    public override string ToString()
    {
        string modName = Required ? "modreq" : "modopt";
        return $"{UnmodifiedType} {modName}({ModifierType})";
    }

    public override string? WhitelistToString()
    {
        return UnmodifiedType.WhitelistToString();
    }

    public override bool WhitelistEquals(MType other)
    {
        return UnmodifiedType.WhitelistEquals(other);
    }
}
