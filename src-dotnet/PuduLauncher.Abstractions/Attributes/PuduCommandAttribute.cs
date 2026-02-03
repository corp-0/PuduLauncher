namespace PuduLauncher.Abstractions.Attributes;

/// <summary>
/// Marks a method as a Pudu command that can be invoked from the frontend.
/// Commands are automatically discovered by the source generator and mapped to HTTP endpoints.
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = false)]
public sealed class PuduCommandAttribute : Attribute
{
    /// <summary>
    /// Gets the name of the command used in the API route.
    /// If null or empty, the method name (in kebab-case) will be used.
    /// </summary>
    public string? Name { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="PuduCommandAttribute"/> class with an explicit command name.
    /// </summary>
    /// <param name="name">The command name used in API routes. If null, the method name will be used.</param>
    public PuduCommandAttribute(string? name = null)
    {
        Name = name;
    }
}
