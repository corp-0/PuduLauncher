using System;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.DependencyInjection;
using Photino.NET.Server;
using PuduLauncher.Services;
using PuduLauncher.Services.Interface;
using Serilog;

namespace PuduLauncher.Hosting;

internal static class AppBootstrapper
{
    internal static bool ResolveDebugMode()
    {
        string? envValue = Environment.GetEnvironmentVariable("IS_DEBUG");
        return bool.TryParse(envValue, out bool parsed) && parsed;
    }

    internal static bool HasEmbeddedManifest()
    {
        string? manifestName = Assembly
            .GetExecutingAssembly()
            .GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("Microsoft.Extensions.FileProviders.Embedded.Manifest.xml", StringComparison.OrdinalIgnoreCase));

        return manifestName is not null;
    }

    internal static WebApplication BuildHost(string[] args)
    {
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
        builder.Services.AddHttpClient<IBlogService, BlogService>();
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

        return builder.Build();
    }

    internal static void ConfigureGrpcPipeline(WebApplication grpcApp)
    {
        grpcApp.UseRouting();
        grpcApp.UseCors("GrpcCors");
        grpcApp.UseGrpcWeb(); // needed for browser-based clients
        grpcApp.MapGrpcService<LauncherService>()
            .EnableGrpcWeb()
            .RequireCors("GrpcCors");
        grpcApp.MapGrpcService<BlogService>()
            .EnableGrpcWeb()
            .RequireCors("GrpcCors");
    }

    internal static Task StartGrpcAsync(WebApplication grpcApp)
    {
        Log.Information("Starting gRPC server on ports 5099/5100");
        return grpcApp.RunAsync();
    }

    internal static string StartStaticFileServer(string[] args)
    {
        PhotinoServer
            .CreateStaticFileServer(args, out string baseUrl)
            .RunAsync();
        return baseUrl;
    }

    internal static string ResolveAppUrl(bool isDebugMode, string baseUrl)
    {
        return isDebugMode ? "http://localhost:5173" : $"{baseUrl}/index.html";
    }

    internal static void ShutdownGrpc(WebApplication grpcApp, Task grpcTask)
    {
        grpcApp.Lifetime.StopApplication();
        grpcTask.Wait();
    }
}
