// ReSharper disable UnusedMember.Global
namespace PuduLauncher.Constants;

public static class Api
{
    private static string CentralCommandBaseUrl => "https://prod-api.unitystation.org";
    public static string ServerListUrl => $"{CentralCommandBaseUrl}/baby-serverlist/servers";
    private static string ChangelogBaseUrl => "https://changelog.unitystation.org";
    public static string Latest10VersionsUrl => $"{ChangelogBaseUrl}/all-changes?format=json&limit=10";
    public static string LatestBlogPosts => $"{ChangelogBaseUrl}/posts/?format=json";
    
    private static string CdnBaseUrl => "https://unitystationfile.b-cdn.net";
    private static string GoodFilesBaseUrl => $"{CdnBaseUrl}/GoodFiles";
    public static string AllowedGoodFilesUrl => $"{GoodFilesBaseUrl}/AllowGoodFiles.json";

    private static string RawGitHubFileBaseUrl => "https://raw.githubusercontent.com/unitystation/unitystation/develop";
    public static string CodeScanListUrl => $"{RawGitHubFileBaseUrl}/CodeScanList.json";
    private static string TtsFiles => $"{CdnBaseUrl}/STTBundleTTS/TTS";
    
    public static string TtsVersionFile => $"{TtsFiles}/version.txt";
}