namespace PuduLauncher.Abstractions.Attributes;

/// <summary>
/// Marks an event model with the event type identifier used by frontend subscribers.
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = false)]
public sealed class PuduEventAttribute : Attribute
{
    /// <summary>
    /// Gets the event type identifier (for example, "timer:tick").
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="PuduEventAttribute"/> class.
    /// </summary>
    /// <param name="name">The event type identifier.</param>
    public PuduEventAttribute(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Event name cannot be null or whitespace.", nameof(name));

        Name = name;
    }
}
