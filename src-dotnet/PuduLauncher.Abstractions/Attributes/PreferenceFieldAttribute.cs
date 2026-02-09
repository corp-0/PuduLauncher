using System;

namespace PuduLauncher.Abstractions.Attributes;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = false)]
public sealed class PreferenceFieldAttribute : Attribute
{
    public string Label { get; }
    public string Component { get; }

    public PreferenceFieldAttribute(string label, string component)
    {
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Field label cannot be null or whitespace.", nameof(label));
        if (string.IsNullOrWhiteSpace(component))
            throw new ArgumentException("Component hint cannot be null or whitespace.", nameof(component));

        Label = label;
        Component = component;
    }
}
