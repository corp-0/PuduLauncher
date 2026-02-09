namespace PuduLauncher.ContentScanning;

public sealed class CodeScanningException : Exception
{
    public CodeScanningException()
    {
    }

    public CodeScanningException(string message) : base(message)
    {
    }

    public CodeScanningException(string message, Exception inner) : base(message, inner)
    {
    }
}
