namespace PuduLauncher.Abstractions.Models;

/// <summary>
/// Represents the result of a command execution with success/failure indication and optional data or error message.
/// </summary>
/// <typeparam name="T">The type of data returned on success.</typeparam>
public class CommandResult<T>
{
    /// <summary>
    /// Gets a value indicating whether the command executed successfully.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the data returned by the command on success.
    /// </summary>
    public T? Data { get; init; }

    /// <summary>
    /// Gets the error message if the command failed.
    /// </summary>
    public string? Error { get; init; }

    /// <summary>
    /// Creates a successful command result with data.
    /// </summary>
    /// <param name="data">The data to return.</param>
    /// <returns>A successful <see cref="CommandResult{T}"/>.</returns>
    public static CommandResult<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };

    /// <summary>
    /// Creates a failed command result with an error message.
    /// </summary>
    /// <param name="error">The error message.</param>
    /// <returns>A failed <see cref="CommandResult{T}"/>.</returns>
    public static CommandResult<T> Fail(string error) => new()
    {
        Success = false,
        Error = error
    };
}
