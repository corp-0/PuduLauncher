namespace PuduLauncher.ContentScanning.Models.ScanningTypes;

public class MMemberRef
{
    public readonly MType ParentType;
    public readonly string Name;

    protected MMemberRef(MType parentType, string name)
    {
        ParentType = parentType;
        Name = name;
    }
}
