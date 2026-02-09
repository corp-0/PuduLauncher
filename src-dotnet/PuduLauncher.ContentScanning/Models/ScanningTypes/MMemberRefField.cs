namespace PuduLauncher.ContentScanning.Models.ScanningTypes;

internal sealed class MMemberRefField : MMemberRef
{
    internal readonly MType FieldType;

    public MMemberRefField(MType parentType, string name, MType fieldType) : base(parentType, name)
    {
        FieldType = fieldType;
    }

    public override string ToString()
    {
        return $"{ParentType}.{Name} Returns {FieldType}";
    }
}
