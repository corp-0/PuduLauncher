using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Threading;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PuduLauncher.Generators;

[Generator]
public class PuduEndpointGenerator : IIncrementalGenerator
{
    private const string PuduControllerAttributeName =
        "PuduLauncher.Abstractions.Attributes.PuduControllerAttribute";

    private const string PuduCommandAttributeName =
        "PuduLauncher.Abstractions.Attributes.PuduCommandAttribute";

    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var controllerProvider = context.SyntaxProvider
            .ForAttributeWithMetadataName(
                PuduControllerAttributeName,
                predicate: static (node, _) => node is ClassDeclarationSyntax,
                transform: static (ctx, ct) => ExtractControllerInfo(ctx, ct))
            .Where(static info => info is not null)
            .Collect();

        context.RegisterSourceOutput(controllerProvider, static (spc, controllers) =>
        {
            GenerateSource(spc, controllers!);
        });
    }

    private static ControllerInfo? ExtractControllerInfo(
        GeneratorAttributeSyntaxContext ctx, System.Threading.CancellationToken ct)
    {
        if (ctx.TargetSymbol is not INamedTypeSymbol classSymbol)
            return null;

        // Get controller name from attribute constructor argument
        var controllerAttr = ctx.Attributes[0];
        if (controllerAttr.ConstructorArguments.Length == 0)
            return null;

        var controllerName = controllerAttr.ConstructorArguments[0].Value as string;
        if (string.IsNullOrWhiteSpace(controllerName))
            return null;

        var commands = new List<CommandInfo>();

        foreach (var member in classSymbol.GetMembers())
        {
            ct.ThrowIfCancellationRequested();

            if (member is not IMethodSymbol method)
                continue;

            var commandAttr = method.GetAttributes().FirstOrDefault(a =>
                a.AttributeClass?.ToDisplayString() == PuduCommandAttributeName);

            if (commandAttr is null)
                continue;

            // Get command name from attribute or kebab-case the method name
            string? commandName = null;
            if (commandAttr.ConstructorArguments.Length > 0)
                commandName = commandAttr.ConstructorArguments[0].Value as string;

            if (string.IsNullOrWhiteSpace(commandName))
                commandName = ToKebabCase(method.Name);

            // Extract parameter info
            string? parameterType = null;
            string? parameterTypeShort = null;
            if (method.Parameters.Length > 0)
            {
                var param = method.Parameters[0];
                parameterType = param.Type.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);
                parameterTypeShort = param.Type.Name;
            }

            // Extract return type info
            var returnType = method.ReturnType;
            var isAsync = false;
            var isVoid = false;
            string? resultType = null;

            // Unwrap Task<T>
            if (returnType is INamedTypeSymbol namedReturn)
            {
                if (namedReturn.Name == "Task" && namedReturn.TypeArguments.Length == 1)
                {
                    isAsync = true;
                    returnType = namedReturn.TypeArguments[0];
                }
                else if (namedReturn.Name == "Task" && namedReturn.TypeArguments.Length == 0)
                {
                    isAsync = true;
                    isVoid = true;
                }
            }

            if (returnType.SpecialType == SpecialType.System_Void)
                isVoid = true;

            if (!isVoid)
                resultType = returnType.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);

            commands.Add(new CommandInfo(
                MethodName: method.Name,
                CommandName: commandName!,
                ParameterType: parameterType,
                ParameterTypeShort: parameterTypeShort,
                ResultType: resultType,
                IsAsync: isAsync,
                IsVoid: isVoid));
        }

        if (commands.Count == 0)
            return null;

        return new ControllerInfo(
            ClassName: classSymbol.Name,
            FullyQualifiedName: classSymbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
            Namespace: classSymbol.ContainingNamespace.ToDisplayString(),
            ControllerName: controllerName!,
            Commands: commands.ToArray());
    }

    private static void GenerateSource(
        SourceProductionContext spc, ImmutableArray<ControllerInfo?> controllers)
    {
        var validControllers = controllers.Where(c => c is not null).Cast<ControllerInfo>().ToArray();
        if (validControllers.Length == 0)
            return;

        var sb = new StringBuilder();
        sb.AppendLine("// <auto-generated/>");
        sb.AppendLine("#nullable enable");
        sb.AppendLine("#pragma warning disable IL2026 // Suppressed: types are registered in AppJsonSerializerContext");
        sb.AppendLine("#pragma warning disable IL3050 // Suppressed: types are registered in AppJsonSerializerContext");
        sb.AppendLine();
        sb.AppendLine("using System.Text.Json;");
        sb.AppendLine("using Microsoft.AspNetCore.Http;");
        sb.AppendLine("using Microsoft.Extensions.DependencyInjection;");
        sb.AppendLine("using Microsoft.Extensions.Options;");
        sb.AppendLine("using Microsoft.AspNetCore.Builder;");
        sb.AppendLine();

        // Collect unique namespaces from controllers
        var namespaces = new HashSet<string>();
        foreach (var controller in validControllers)
        {
            namespaces.Add(controller.Namespace);
            foreach (var cmd in controller.Commands)
            {
                if (cmd.ParameterType is not null)
                {
                    var ns = GetNamespaceFromFullyQualified(cmd.ParameterType);
                    if (ns is not null)
                        namespaces.Add(ns);
                }
            }
        }

        foreach (var ns in namespaces.OrderBy(n => n))
        {
            sb.AppendLine($"using {ns};");
        }

        sb.AppendLine();
        sb.AppendLine("namespace PuduLauncher.Generated;");
        sb.AppendLine();
        sb.AppendLine("public static class PuduEndpoints");
        sb.AppendLine("{");

        // AddPuduControllers
        sb.AppendLine("    public static IServiceCollection AddPuduControllers(this IServiceCollection services)");
        sb.AppendLine("    {");
        foreach (var controller in validControllers)
        {
            sb.AppendLine($"        services.AddScoped<{controller.ClassName}>();");
        }
        sb.AppendLine("        return services;");
        sb.AppendLine("    }");
        sb.AppendLine();

        // MapPuduEndpoints
        sb.AppendLine("    public static WebApplication MapPuduEndpoints(this WebApplication app)");
        sb.AppendLine("    {");
        sb.AppendLine("        var jsonOptions = app.Services");
        sb.AppendLine("            .GetRequiredService<IOptions<Microsoft.AspNetCore.Http.Json.JsonOptions>>()");
        sb.AppendLine("            .Value.SerializerOptions;");
        sb.AppendLine();

        foreach (var controller in validControllers)
        {
            foreach (var cmd in controller.Commands)
            {
                var route = $"/api/{controller.ControllerName}/{cmd.CommandName}";
                sb.AppendLine($"        app.MapPost(\"{route}\", async (HttpContext ctx) =>");
                sb.AppendLine("        {");

                // Deserialize parameter if present
                if (cmd.ParameterType is not null)
                {
                    sb.AppendLine($"            var command = await JsonSerializer.DeserializeAsync<{cmd.ParameterTypeShort}>(ctx.Request.Body, jsonOptions, ctx.RequestAborted);");
                    sb.AppendLine("            if (command is null)");
                    sb.AppendLine("            {");
                    sb.AppendLine("                ctx.Response.StatusCode = 400;");
                    sb.AppendLine("                return;");
                    sb.AppendLine("            }");
                }

                // Resolve controller from DI
                sb.AppendLine($"            var controller = ctx.RequestServices.GetRequiredService<{controller.ClassName}>();");

                // Call method
                var awaitPrefix = cmd.IsAsync ? "await " : "";
                var args = cmd.ParameterType is not null ? "command" : "";

                if (cmd.IsVoid)
                {
                    sb.AppendLine($"            {awaitPrefix}controller.{cmd.MethodName}({args});");
                    sb.AppendLine("            ctx.Response.StatusCode = 204;");
                }
                else
                {
                    sb.AppendLine($"            var result = {awaitPrefix}controller.{cmd.MethodName}({args});");
                    sb.AppendLine("            ctx.Response.ContentType = \"application/json\";");
                    sb.AppendLine("            await JsonSerializer.SerializeAsync(ctx.Response.Body, result, jsonOptions, ctx.RequestAborted);");
                }

                sb.AppendLine("        });");
                sb.AppendLine();
            }
        }

        sb.AppendLine("        return app;");
        sb.AppendLine("    }");
        sb.AppendLine("}");

        spc.AddSource("PuduEndpoints.g.cs", sb.ToString());
    }

    private static string? GetNamespaceFromFullyQualified(string fullyQualified)
    {
        // "global::PuduLauncher.Models.Commands.GreetCommand" -> "PuduLauncher.Models.Commands"
        var name = fullyQualified.Replace("global::", "");
        var lastDot = name.LastIndexOf('.');
        if (lastDot <= 0)
            return null;
        return name.Substring(0, lastDot);
    }

    private static string ToKebabCase(string name)
    {
        if (string.IsNullOrEmpty(name))
            return name;

        var sb = new StringBuilder();
        for (int i = 0; i < name.Length; i++)
        {
            var c = name[i];
            if (char.IsUpper(c))
            {
                if (i > 0)
                    sb.Append('-');
                sb.Append(char.ToLowerInvariant(c));
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    private record ControllerInfo(
        string ClassName,
        string FullyQualifiedName,
        string Namespace,
        string ControllerName,
        CommandInfo[] Commands);

    private record CommandInfo(
        string MethodName,
        string CommandName,
        string? ParameterType,
        string? ParameterTypeShort,
        string? ResultType,
        bool IsAsync,
        bool IsVoid);
}
