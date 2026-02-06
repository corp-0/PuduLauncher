namespace PuduLauncher.Abstractions.Attributes;

/// <summary>
/// Marks a class as a Pudu controller that can handle commands from the frontend.
/// Controllers are automatically discovered by the source generator and registered in the DI container.
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = false)]
public sealed class PuduControllerAttribute : Attribute
{
    /// <summary>
    /// Gets the name of the controller used in the API route (e.g., "launcher" results in /api/launcher/{command}).
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="PuduControllerAttribute"/> class.
    /// </summary>
    /// <param name="name">The controller name used in API routes.</param>
    public PuduControllerAttribute(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Controller name cannot be null or whitespace.", nameof(name));

        Name = name;
    }
}
