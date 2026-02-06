// Polyfill for netstandard2.0 to enable record types and init properties.
namespace System.Runtime.CompilerServices
{
    internal static class IsExternalInit { }
}
