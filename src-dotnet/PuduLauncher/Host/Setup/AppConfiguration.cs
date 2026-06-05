using System.Net.WebSockets;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Host.Infrastructure;

namespace PuduLauncher.Host.Setup;

public static class AppConfiguration
{
    /// <summary>
    /// Maps infrastructure endpoints: CORS middleware, health check, and WebSocket event stream.
    /// </summary>
    public static void MapPuduInfrastructure(this WebApplication app)
    {
        app.UseCors();
        app.UseWebSockets();

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
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client",
                            CancellationToken.None);
                        break;
                    }
                }
            }
            finally
            {
                publisher.RemoveClient(webSocket);
            }
        });
    }

    /// <summary>
    /// Starts the app on an ephemeral port, prints SIDECAR_PORT for Rust discovery, and waits for shutdown.
    /// </summary>
    public static async Task StartAsSidecarAsync(this WebApplication app)
    {
        var devPort = Environment.GetEnvironmentVariable("PUDU_DEV_PORT");
        app.Urls.Add(devPort != null ? $"http://127.0.0.1:{devPort}" : "http://127.0.0.1:0");
        await app.StartAsync();

        var server = app.Services.GetRequiredService<IServer>();
        var addresses = server.Features.Get<IServerAddressesFeature>();
        string address = addresses!.Addresses.First();
        int port = new Uri(address).Port;
        
        // Keep printing SIDECAR_PORT until Rust acknowledges via stdin.
        // This handshake ensures port discovery succeeds regardless of startup timing.
        var ackTask = Task.Run(() => Console.In.ReadLine());
        while (!ackTask.IsCompleted)
        {
            await Console.Out.WriteLineAsync($"SIDECAR_PORT:{port}");
            await Console.Out.FlushAsync();
            await Task.Delay(100);
        }

        app.Logger.LogInformation("PuduLauncher Sidecar started on port {Port}", port);

        // Listen for a graceful shutdown signal from the Rust host over stdin.
        // A "SHUTDOWN" line or stdin EOF triggers a graceful host shutdown, which
        // lets TtsShutdownHostedService stop the TTS server before we exit.
        _ = Task.Run(() => ListenForShutdownAsync(app));

        await app.WaitForShutdownAsync();
    }

    private static async Task ListenForShutdownAsync(WebApplication app)
    {
        try
        {
            while (true)
            {
                string? line = await Console.In.ReadLineAsync();

                // Null means stdin reached EOF (the host went away). Either an
                // explicit SHUTDOWN or EOF should trigger a graceful shutdown.
                if (line is null || string.Equals(line.Trim(), "SHUTDOWN", StringComparison.OrdinalIgnoreCase))
                {
                    app.Logger.LogInformation("Received shutdown signal via stdin");
                    app.Lifetime.StopApplication();
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "stdin shutdown listener stopped unexpectedly");
        }
    }
}
