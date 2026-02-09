namespace PuduLauncher.ContentScanning.Models.ScanningTypes;

internal sealed record MResScopeType(MType Type) : MResScope
{
    public override string ToString()
    {
        return $"{Type}/";
    }
}
