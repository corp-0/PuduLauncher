namespace PuduLauncher.ContentScanning.Models;

public class ScanLog
{
    public enum LogType
    {
        Info,
        Error
    }

    /// <summary>
    ///   Used to know which log we need to write this to
    /// </summary>
    public LogType Type { get; init; } = LogType.Info;

    /// <summary>
    ///   Log message to be written
    /// </summary>
    public string LogMessage { get; init; } = string.Empty;
}
