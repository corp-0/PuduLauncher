using System.Net.WebSockets;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Generated;
using PuduLauncher.Host.Infrastructure;
using PuduLauncher.Services;
using Serilog;
using Serilog.Events;
using AppJsonSerializerContext = PuduLauncher.AppJsonSerializerContext;

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

try
{
    var builder = WebApplication.CreateSlimBuilder(args);
    builder.Host.UseSerilog();

    builder.Services.ConfigureHttpJsonOptions(options =>
    {
        options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
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

    builder.Services.AddSingleton<IEventPublisher, WebSocketEventPublisher>();

    builder.Services.AddPuduControllers();

    builder.Services.AddHostedService<ClockService>();

    var app = builder.Build();

    if (usedFallbackLogDirectory)
    {
        app.Logger.LogWarning("Could not create logs directory next to executable. Using fallback directory: {LogDirectory}", logDirectory);
    }

    app.UseCors();

    app.UseWebSockets();

    app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTimeOffset.UtcNow }));

    app.MapGet("/events", async (HttpContext context, IEventPublisher eventPublisher) =>
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = 400;
            return;
        }

        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var publisher = (WebSocketEventPublisher)eventPublisher;
        publisher.AddClient(webSocket);

        try
        {
            var buffer = new byte[1024];
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                    break;
                }
            }
        }
        finally
        {
            publisher.RemoveClient(webSocket);
        }
    });

    app.MapPuduEndpoints();

    // Use ephemeral port allocation to prevent startup failures from fixed-port collisions.
    app.Urls.Add("http://127.0.0.1:0");
    await app.StartAsync();

    var server = app.Services.GetRequiredService<Microsoft.AspNetCore.Hosting.Server.IServer>();
    var addresses = server.Features.Get<Microsoft.AspNetCore.Hosting.Server.Features.IServerAddressesFeature>();
    var address = addresses!.Addresses.First();
    var port = new Uri(address).Port;

    // This line is parsed by sidecar.rs to discover the port
    Console.Out.WriteLine($"SIDECAR_PORT:{port}");
    Console.Out.Flush();

    app.Logger.LogInformation("PuduLauncher Sidecar started on port {Port}", port);
    app.Logger.LogInformation("Log file path pattern: {LogFilePath}", logFilePath);

    await app.WaitForShutdownAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "PuduLauncher sidecar terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

static (string DirectoryPath, bool FallbackUsed) ResolveLogDirectory()
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
