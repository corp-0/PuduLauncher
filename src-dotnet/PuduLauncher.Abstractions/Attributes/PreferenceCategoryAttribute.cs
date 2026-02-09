using System;

namespace PuduLauncher.Abstractions.Attributes;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = false)]
public sealed class PreferenceCategoryAttribute : Attribute
{
    public string Label { get; }

    public PreferenceCategoryAttribute(string label)
    {
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Category label cannot be null or whitespace.", nameof(label));

        Label = label;
    }
}
