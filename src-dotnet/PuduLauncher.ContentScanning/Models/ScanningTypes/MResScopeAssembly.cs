namespace PuduLauncher.ContentScanning.Models.ScanningTypes;

internal sealed record MResScopeAssembly(string Name) : MResScope
{
    public override string ToString()
    {
        return $"[{Name}]";
    }
}
