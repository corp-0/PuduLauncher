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

    builder.Services.AddSingleton<IEnvironmentService, EnvironmentService>();
    builder.Services.AddSingleton<IPreferencesService, PreferencesService>();
    builder.Services.AddSingleton<IBlogService, BlogService>();
    builder.Services.AddSingleton<IChangelogService, ChangelogService>();
    builder.Services.AddSingleton<IPingService, PingService>();
    builder.Services.AddSingleton<IInstallationService, InstallationService>();
    builder.Services.AddSingleton<IScannerService, ScannerService>();
    builder.Services.AddSingleton<IDownloadService, DownloadService>();
    builder.Services.AddSingleton<IGameLaunchService, GameLaunchService>();
    builder.Services.AddHostedService<ServerListService>();

    // ── App ───────────────────────────────────────────
    WebApplication app = builder.Build();

    app.MapPuduInfrastructure();
    app.MapPuduEndpoints(); // Generated

    // Force initialization so stale installations are reconciled at startup.
    app.Services.GetRequiredService<IInstallationService>();

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
