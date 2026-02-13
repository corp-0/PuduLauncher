namespace PuduLauncher.Extensions;
using System;
using System.Collections.Generic;

public static class UriBuilderExtensions
{
    public static UriBuilder AppendPathSegments(this UriBuilder b, params string[] segments)
    {
        if (segments.Length == 0) return b;
        
        var basePath = (b.Path ?? "").TrimEnd('/');
        
        foreach (var raw in segments)
        {
            if (string.IsNullOrWhiteSpace(raw)) continue;

            var seg = raw.Trim('/');
            
            foreach (var piece in seg.Split('/', StringSplitOptions.RemoveEmptyEntries))
            {
                basePath += "/" + Uri.EscapeDataString(piece);
            }
        }

        b.Path = string.IsNullOrEmpty(basePath) ? "/" : basePath;
        return b;
    }
}

