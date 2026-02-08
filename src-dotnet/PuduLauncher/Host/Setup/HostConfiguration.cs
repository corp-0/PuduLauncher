using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Host.Infrastructure;
using Serilog;
using Serilog.Events;

namespace PuduLauncher.Host.Setup;

public static class HostConfiguration
{
    /// <summary>
    /// Configures Serilog logging, JSON serialization, and CORS.
    /// </summary>
    public static void ConfigurePuduHost(this WebApplicationBuilder builder)
    {
        var (logDirectory, usedFallbackLogDirectory) = ResolveLogDirectory();
        var logFilePath = Path.Combine(logDirectory, "pudulauncher-.log");

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            // Keep runtime logs away from stdout, which is used for SIDECAR_PORT discovery.
            .WriteTo.Console(standardErrorFromLevel: LogEventLevel.Verbose)
            .WriteTo.File(
                path: logFilePath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14,
                shared: true)
            .CreateLogger();

        builder.Host.UseSerilog();

        // Store for later use in startup logging
        builder.Configuration["Logging:FilePath"] = logFilePath;
        builder.Configuration["Logging:UsedFallback"] = usedFallbackLogDirectory.ToString();

        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.TypeInfoResolverChain.Insert(0, JsonCtx.Default);
        });

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins("http://localhost:1420", "http://tauri.localhost", "tauri://localhost")
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });
    }

    /// <summary>
    /// Registers framework-level infrastructure services (event publisher, etc.).
    /// </summary>
    public static void AddPuduInfrastructure(this IServiceCollection services)
    {
        services.AddHttpClient();
        services.AddSingleton<IEventPublisher, WebSocketEventPublisher>();
    }

    private static (string DirectoryPath, bool FallbackUsed) ResolveLogDirectory()
    {
        var preferred = Path.Combine(AppContext.BaseDirectory, "logs");
        try
        {
            Directory.CreateDirectory(preferred);
            return (preferred, false);
        }
        catch
        {
            var fallback = Path.Combine(Path.GetTempPath(), "PuduLauncher", "logs");
            Directory.CreateDirectory(fallback);
            return (fallback, true);
        }
    }
}
