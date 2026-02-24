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
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("System.Net.Http.HttpClient", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            // Logs go to stderr only. Rust captures them and writes to the unified log file.
            // No timestamp: tauri-plugin-log adds its own. Format: [INF] message
            .WriteTo.Console(
                outputTemplate: "[{Level:u3}] {Message:lj}{NewLine}{Exception}",
                standardErrorFromLevel: LogEventLevel.Verbose)
            .CreateLogger();

        builder.Host.UseSerilog();

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
}
