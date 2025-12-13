using System.Drawing;
using Microsoft.AspNetCore.Builder;
using Photino.NET;
using PuduLauncher.Hosting;
using Serilog;
using Serilog.Events;

namespace PuduLauncher;

class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Is(LogEventLevel.Information)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .CreateLogger();

        bool isDebugMode = AppBootstrapper.ResolveDebugMode();
        Log.Information("Starting PuduLauncher (debug mode: {DebugMode})", isDebugMode);

        // Ensure embedded frontend assets are present before starting anything.
        bool embeddedAvailable = AppBootstrapper.HasEmbeddedManifest();
        if (!embeddedAvailable)
        {
            Log.Error("Embedded frontend assets are missing. Build the UI first: cd UserInterface/PuduLauncherUi && npm install && npm run build");
            return;
        }

        try
        {
            WebApplication grpcApp = AppBootstrapper.BuildHost(args);
            AppBootstrapper.ConfigureGrpcPipeline(grpcApp);
            Task grpcTask = AppBootstrapper.StartGrpcAsync(grpcApp);

            Log.Information("Serving embedded frontend assets");
            string baseUrl = AppBootstrapper.StartStaticFileServer(args);

            string appUrl = AppBootstrapper.ResolveAppUrl(isDebugMode, baseUrl);
            Log.Information("Serving React app at {AppUrl}", appUrl);

            string iconPath = Path.Combine(AppContext.BaseDirectory, "pudu.ico");
            PhotinoWindow window = new PhotinoWindow()
                .SetTitle("PuduLauncher")
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
            AppBootstrapper.ShutdownGrpc(grpcApp, grpcTask);
            Log.Information("Shutdown complete");
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
