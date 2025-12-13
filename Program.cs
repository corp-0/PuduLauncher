using System.Drawing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Reflection;
using System.IO;
using Photino.NET;
using Photino.NET.Server;
using PuduLauncher.Services;
using PuduLauncher.Services.Interface;
using Serilog;
using Serilog.Events;

namespace PuduLauncher;

class Program
{
    private static bool ResolveDebugMode()
    {
        string? envValue = Environment.GetEnvironmentVariable("IS_DEBUG");
        return bool.TryParse(envValue, out bool parsed) && parsed;
    }

    private static bool HasEmbeddedManifest()
    {
        string? manifestName = Assembly
            .GetExecutingAssembly()
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("Microsoft.Extensions.FileProviders.Embedded.Manifest.xml", StringComparison.OrdinalIgnoreCase));

        return manifestName is not null;
    }

    [STAThread]
    private static void Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Is(LogEventLevel.Information)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .CreateLogger();

        bool isDebugMode = ResolveDebugMode();
        Log.Information("Starting PuduLauncher (debug mode: {DebugMode})", isDebugMode);

        // Ensure embedded frontend assets are present before starting anything.
        bool embeddedAvailable = HasEmbeddedManifest();
        if (!embeddedAvailable)
        {
            Log.Error("Embedded frontend assets are missing. Build the UI first: cd UserInterface/PuduLauncherUi && npm install && npm run build");
            return;
        }

        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Host.UseSerilog((ctx, services, cfg) =>
        {
            cfg
                .ReadFrom.Configuration(ctx.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext()
                .WriteTo.Console();
        });

        builder.Services.AddGrpc();
        builder.Services.AddSingleton<IEnvironmentService, EnvironmentService>();
        builder.Services.AddSingleton<IPreferencesService, PreferencesService>();
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("GrpcCors", policy =>
            {
                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetIsOriginAllowed(_ => true);
            });
        });

        builder.WebHost.ConfigureKestrel(o =>
        {
            o.ListenLocalhost(5099, lo => lo.Protocols = HttpProtocols.Http2);
            o.ListenLocalhost(5100, lo => lo.Protocols = HttpProtocols.Http1);
        });

        WebApplication grpcApp = builder.Build();
        Log.Information("gRPC host built; configuring middleware");
        grpcApp.UseRouting();
        grpcApp.UseCors("GrpcCors");
        grpcApp.UseGrpcWeb(); // needed for browser-based clients
        grpcApp.MapGrpcService<LauncherService>()
            .EnableGrpcWeb()
            .RequireCors("GrpcCors");

        Log.Information("Starting gRPC server on ports 5099/5100");
        Task grpcTask = grpcApp.RunAsync();

        string baseUrl;
        Log.Information("Serving embedded frontend assets");
        PhotinoServer
            .CreateStaticFileServer(args, out baseUrl)
            .RunAsync();

        // The appUrl is set to the local development server when in debug mode.
        // This helps with hot reloading and debugging.
        string appUrl = isDebugMode ? "http://localhost:5173" : $"{baseUrl}/index.html";
        Log.Information("Serving React app at {AppUrl}", appUrl);

        // Window title declared here for visibility
        const string windowTitle = "PuduLauncher";
        string iconPath = Path.Combine(AppContext.BaseDirectory, "pudu.ico");
        
        PhotinoWindow? window = new PhotinoWindow()
            .SetTitle(windowTitle)
            .SetUseOsDefaultSize(false)
            .SetSize(new Size(2048, 1024))
            .Center()
            .SetResizable(true)
            .SetIconFile(iconPath);
        
        window.Load(appUrl);
        Log.Information("Photino window loaded");
        window.WaitForClose();

        // Allow graceful shutdown of the gRPC server after the window closes.
        Log.Information("Photino window closed; stopping gRPC host");
        grpcApp.Lifetime.StopApplication();
        grpcTask.Wait();
        Log.Information("Shutdown complete");
        Log.CloseAndFlush();
    }
}
