using PuduLauncher.Generated;
using PuduLauncher.Host.Setup;
using PuduLauncher.Services;
using PuduLauncher.Services.Interfaces;
using Serilog;

try
{
    WebApplicationBuilder builder = WebApplication.CreateSlimBuilder(args);

    builder.ConfigurePuduHost();

    // ── Services ──────────────────────────────────────
    builder.Services.AddPuduInfrastructure();
    builder.Services.AddPuduControllers(); // Generated

    // Register your services below:
    builder.Services.AddSingleton<IEnvironmentService, EnvironmentService>();
    builder.Services.AddSingleton<IPreferencesService, PreferencesService>();
    builder.Services.AddSingleton<IBlogService, BlogService>();
    builder.Services.AddSingleton<IPingService, PingService>();
    builder.Services.AddHostedService<ServerListService>();

    // ── App ───────────────────────────────────────────
    WebApplication app = builder.Build();

    app.MapPuduInfrastructure();
    app.MapPuduEndpoints(); // Generated

    await app.StartAsSidecarAsync();
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
