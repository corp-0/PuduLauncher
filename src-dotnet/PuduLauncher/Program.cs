using System.Net.WebSockets;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Generated;
using PuduLauncher.Infrastructure;
using PuduLauncher.Services;
using AppJsonSerializerContext = PuduLauncher.AppJsonSerializerContext;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

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

await app.WaitForShutdownAsync();
