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

    private const string PuduEventAttributeName =
        "PuduLauncher.Abstractions.Attributes.PuduEventAttribute";

    private const string EventBaseTypeName =
        "PuduLauncher.Abstractions.Models.EventBase";

    private const string ManifestStartMarker = "PUDU_MANIFEST_START";
    private const string ManifestEndMarker = "PUDU_MANIFEST_END";

    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var controllerProvider = context.SyntaxProvider
            .ForAttributeWithMetadataName(
                PuduControllerAttributeName,
                predicate: static (node, _) => node is ClassDeclarationSyntax,
                transform: static (ctx, ct) => ExtractControllerInfo(ctx, ct))
            .Where(static info => info is not null)
            .Collect();

        var generationInput = context.CompilationProvider.Combine(controllerProvider);

        context.RegisterSourceOutput(generationInput, static (spc, input) =>
        {
            var compilation = input.Left;
            var controllers = input.Right;
            GenerateSources(spc, compilation, controllers!);
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
            var parameters = new ParameterInfo[method.Parameters.Length];
            for (int pi = 0; pi < method.Parameters.Length; pi++)
            {
                var param = method.Parameters[pi];
                parameters[pi] = new ParameterInfo(
                    Name: param.Name,
                    FullyQualifiedType: param.Type.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
                    TypeTs: MapTypeToTypeScript(param.Type),
                    JsonAccessor: GetJsonAccessor(param.Type));
            }

            // Extract return type info
            var returnType = method.ReturnType;
            var isAsync = false;
            var isVoid = false;
            var resultTypeTs = "void";
            string? resultTypeClr = null;

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
            {
                resultTypeTs = MapTypeToTypeScript(returnType);
                resultTypeClr = returnType.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);
            }

            commands.Add(new CommandInfo(
                MethodName: method.Name,
                CommandName: commandName!,
                Parameters: parameters,
                ResultTypeTs: resultTypeTs,
                ResultTypeClr: resultTypeClr,
                IsAsync: isAsync,
                IsVoid: isVoid));
        }

        if (commands.Count == 0)
            return null;

        return new ControllerInfo(
            FullyQualifiedName: classSymbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
            ControllerName: controllerName!,
            Commands: commands.ToArray());
    }

    private static void GenerateSources(
        SourceProductionContext spc,
        Compilation compilation,
        ImmutableArray<ControllerInfo?> controllers)
    {
        var validControllers = controllers.Where(c => c is not null).Cast<ControllerInfo>().ToArray();
        var manifest = BuildManifest(compilation, validControllers);
        GenerateManifestSource(spc, manifest);

        if (validControllers.Length == 0)
            return;

        GenerateEndpointSource(spc, validControllers);
    }

    private static void GenerateEndpointSource(
        SourceProductionContext spc, ControllerInfo[] validControllers)
    {
        var sb = new StringBuilder();
        sb.AppendLine("// <auto-generated/>");
        sb.AppendLine("#nullable enable");
        sb.AppendLine("#pragma warning disable IL2026 // Suppressed: types are registered in JsonCtx");
        sb.AppendLine("#pragma warning disable IL3050 // Suppressed: types are registered in JsonCtx");
        sb.AppendLine();
        sb.AppendLine("using System;");
        sb.AppendLine("using System.Text.Json;");
        sb.AppendLine("using Microsoft.AspNetCore.Http;");
        sb.AppendLine("using Microsoft.Extensions.DependencyInjection;");
        sb.AppendLine("using Microsoft.AspNetCore.Builder;");
        sb.AppendLine("using JsonCtx = PuduLauncher.JsonCtx;");
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
            sb.AppendLine($"        services.AddScoped<{controller.FullyQualifiedName}>();");
        }
        sb.AppendLine("        return services;");
        sb.AppendLine("    }");
        sb.AppendLine();

        // MapPuduEndpoints
        sb.AppendLine("    public static WebApplication MapPuduEndpoints(this WebApplication app)");
        sb.AppendLine("    {");

        foreach (var controller in validControllers)
        {
            foreach (var cmd in controller.Commands)
            {
                var route = $"/api/{controller.ControllerName}/{cmd.CommandName}";
                var commandResultClrType = cmd.IsVoid
                    ? "global::PuduLauncher.Abstractions.Models.CommandResult<object>"
                    : $"global::PuduLauncher.Abstractions.Models.CommandResult<{cmd.ResultTypeClr}>";
                sb.AppendLine($"        app.MapPost(\"{route}\", async (HttpContext ctx) =>");
                sb.AppendLine("        {");
                sb.AppendLine("            try");
                sb.AppendLine("            {");

                // Deserialize parameters
                if (cmd.Parameters.Length == 1 && cmd.Parameters[0].JsonAccessor is null)
                {
                    // Single complex parameter: deserialize the whole body as that type
                    var p = cmd.Parameters[0];
                    sb.AppendLine($"                var commandTypeInfo = JsonCtx.Default.GetTypeInfo(typeof({p.FullyQualifiedType}))");
                    sb.AppendLine($"                    ?? throw new InvalidOperationException(\"Type {p.FullyQualifiedType} is not registered in JsonCtx. Run 'npm run generate-ts'.\");");
                    sb.AppendLine($"                var p_{p.Name} = ({p.FullyQualifiedType}?)await JsonSerializer.DeserializeAsync(ctx.Request.Body, commandTypeInfo, ctx.RequestAborted);");
                    sb.AppendLine($"                if (p_{p.Name} is null)");
                    sb.AppendLine("                {");
                    sb.AppendLine("                    throw new InvalidOperationException(\"Request body cannot be null.\");");
                    sb.AppendLine("                }");
                }
                else if (cmd.Parameters.Length >= 1)
                {
                    sb.AppendLine("                using var doc = await JsonDocument.ParseAsync(ctx.Request.Body, cancellationToken: ctx.RequestAborted);");
                    sb.AppendLine("                var root = doc.RootElement;");
                    foreach (var p in cmd.Parameters)
                    {
                        var propName = ToCamelCase(p.Name);
                        if (p.JsonAccessor is not null)
                        {
                            sb.AppendLine($"                var p_{p.Name} = root.GetProperty(\"{propName}\").{p.JsonAccessor};");
                        }
                        else
                        {
                            sb.AppendLine($"                var p_{p.Name} = ({p.FullyQualifiedType}?)root.GetProperty(\"{propName}\").Deserialize(typeof({p.FullyQualifiedType}), JsonCtx.Default);");
                        }
                    }
                }

                // Resolve controller from DI
                sb.AppendLine($"                var controller = ctx.RequestServices.GetRequiredService<{controller.FullyQualifiedName}>();");

                // Call method
                var awaitPrefix = cmd.IsAsync ? "await " : "";
                var args = cmd.Parameters.Length > 0
                    ? string.Join(", ", cmd.Parameters.Select(p => $"p_{p.Name}"))
                    : "";

                if (cmd.IsVoid)
                {
                    sb.AppendLine($"                {awaitPrefix}controller.{cmd.MethodName}({args});");
                    sb.AppendLine($"                var commandResult = new {commandResultClrType} {{ Success = true }};");
                }
                else
                {
                    sb.AppendLine($"                var result = {awaitPrefix}controller.{cmd.MethodName}({args});");
                    sb.AppendLine($"                var commandResult = {commandResultClrType}.Ok(result);");
                }

                sb.AppendLine($"                var commandResultTypeInfo = JsonCtx.Default.GetTypeInfo(typeof({commandResultClrType}))");
                sb.AppendLine($"                    ?? throw new InvalidOperationException(\"Type {commandResultClrType} is not registered in JsonCtx. Run 'npm run generate-ts'.\");");
                sb.AppendLine("                ctx.Response.ContentType = \"application/json\";");
                sb.AppendLine("                await JsonSerializer.SerializeAsync(ctx.Response.Body, commandResult, commandResultTypeInfo, ctx.RequestAborted);");
                sb.AppendLine("            }");
                sb.AppendLine("            catch (Exception ex)");
                sb.AppendLine("            {");
                sb.AppendLine($"                var commandError = {commandResultClrType}.Fail(ex.Message);");
                sb.AppendLine($"                var commandErrorTypeInfo = JsonCtx.Default.GetTypeInfo(typeof({commandResultClrType}))");
                sb.AppendLine($"                    ?? throw new InvalidOperationException(\"Type {commandResultClrType} is not registered in JsonCtx. Run 'npm run generate-ts'.\");");
                sb.AppendLine("                ctx.Response.ContentType = \"application/json\";");
                sb.AppendLine("                await JsonSerializer.SerializeAsync(ctx.Response.Body, commandError, commandErrorTypeInfo, ctx.RequestAborted);");
                sb.AppendLine("            }");
                sb.AppendLine("        });");
                sb.AppendLine();
            }
        }

        sb.AppendLine("        return app;");
        sb.AppendLine("    }");
        sb.AppendLine("}");

        spc.AddSource("PuduEndpoints.g.cs", sb.ToString());
    }

    private static Manifest BuildManifest(Compilation compilation, ControllerInfo[] controllers)
    {
        var controllerInfos = controllers
            .OrderBy(c => c.ControllerName, StringComparer.Ordinal)
            .Select(c => new ManifestController(
                Name: c.ControllerName,
                Commands: c.Commands
                    .OrderBy(cmd => cmd.CommandName, StringComparer.Ordinal)
                    .Select(cmd => new ManifestCommand(
                        Name: cmd.CommandName,
                        MethodName: cmd.MethodName,
                        Parameters: cmd.Parameters.Select(p => new ManifestParameter(
                            Name: ToCamelCase(p.Name),
                            Type: p.TypeTs,
                            ClrType: p.FullyQualifiedType)).ToArray(),
                        ReturnType: cmd.ResultTypeTs,
                        ReturnClrType: cmd.ResultTypeClr,
                        IsVoid: cmd.IsVoid))
                    .ToArray()))
            .ToArray();

        var modelInfos = ExtractModelInfos(compilation)
            .OrderBy(model => model.Name, StringComparer.Ordinal)
            .ToArray();

        return new Manifest(
            Version: 1,
            Controllers: controllerInfos,
            Models: modelInfos);
    }

    private static ModelInfo[] ExtractModelInfos(Compilation compilation)
    {
        var modelSymbols = new Dictionary<string, INamedTypeSymbol>(StringComparer.Ordinal);
        var eventBaseSymbol = compilation.GetTypeByMetadataName(EventBaseTypeName);

        AddModelTypesFromNamespace(compilation.Assembly.GlobalNamespace, modelSymbols);

        foreach (var assembly in compilation.SourceModule.ReferencedAssemblySymbols)
        {
            if (assembly.Name.StartsWith("PuduLauncher", StringComparison.Ordinal))
                AddModelTypesFromNamespace(assembly.GlobalNamespace, modelSymbols);
        }

        var models = new List<ModelInfo>();

        foreach (var symbol in modelSymbols.Values)
        {
            var properties = symbol
                .GetMembers()
                .OfType<IPropertySymbol>()
                .Where(IsSerializableInstanceProperty)
                .OrderBy(p => p.Locations.FirstOrDefault()?.SourceSpan.Start ?? int.MaxValue)
                .Select(p => new ModelPropertyInfo(
                    Name: ToCamelCase(p.Name),
                    Type: MapTypeToTypeScript(p.Type),
                    Optional: IsOptionalProperty(p)))
                .ToArray();

            string? baseType = null;
            if (symbol.BaseType is not null && symbol.BaseType.SpecialType != SpecialType.System_Object)
                baseType = MapTypeToTypeScript(symbol.BaseType);

            models.Add(new ModelInfo(
                Name: symbol.Name,
                TypeParameters: symbol.TypeParameters.Select(tp => tp.Name).ToArray(),
                ClrType: symbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat),
                BaseType: baseType,
                EventType: GetEventType(symbol, eventBaseSymbol),
                Properties: properties));
        }

        return models.ToArray();
    }

    private static void AddModelTypesFromNamespace(
        INamespaceSymbol ns,
        Dictionary<string, INamedTypeSymbol> modelSymbols)
    {
        foreach (var nested in ns.GetNamespaceMembers())
            AddModelTypesFromNamespace(nested, modelSymbols);

        foreach (var type in ns.GetTypeMembers())
            AddModelTypes(type, modelSymbols);
    }

    private static void AddModelTypes(
        INamedTypeSymbol type,
        Dictionary<string, INamedTypeSymbol> modelSymbols)
    {
        foreach (var nested in type.GetTypeMembers())
            AddModelTypes(nested, modelSymbols);

        if (!IsModelType(type))
            return;

        var key = type.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat);
        if (!modelSymbols.ContainsKey(key))
            modelSymbols.Add(key, type);
    }

    private static bool IsModelType(INamedTypeSymbol type)
    {
        if (type.DeclaredAccessibility != Accessibility.Public)
            return false;

        if (type.IsStatic)
            return false;

        if (type.TypeKind != TypeKind.Class && type.TypeKind != TypeKind.Struct)
            return false;

        var ns = type.ContainingNamespace.ToDisplayString();
        if (string.IsNullOrWhiteSpace(ns))
            return false;

        return ns.EndsWith(".Models", StringComparison.Ordinal) ||
               ns.IndexOf(".Models.", StringComparison.Ordinal) >= 0;
    }

    private static bool IsSerializableInstanceProperty(IPropertySymbol property)
    {
        if (property.DeclaredAccessibility != Accessibility.Public)
            return false;

        if (property.IsStatic || property.IsIndexer)
            return false;

        return property.GetMethod is not null;
    }

    private static bool IsOptionalProperty(IPropertySymbol property)
    {
        if (property.NullableAnnotation == NullableAnnotation.Annotated)
            return true;

        if (property.Type is INamedTypeSymbol named)
        {
            return named.OriginalDefinition.SpecialType == SpecialType.System_Nullable_T;
        }

        return false;
    }

    private static string? GetEventType(INamedTypeSymbol symbol, INamedTypeSymbol? eventBaseSymbol)
    {
        if (eventBaseSymbol is null || !InheritsFrom(symbol, eventBaseSymbol))
            return null;

        var eventAttribute = symbol.GetAttributes().FirstOrDefault(a =>
            a.AttributeClass?.ToDisplayString() == PuduEventAttributeName);

        if (eventAttribute is null || eventAttribute.ConstructorArguments.Length == 0)
            return null;

        var eventType = eventAttribute.ConstructorArguments[0].Value as string;
        if (string.IsNullOrWhiteSpace(eventType))
            return null;

        return eventType;
    }

    private static bool InheritsFrom(INamedTypeSymbol symbol, INamedTypeSymbol baseTypeSymbol)
    {
        for (var current = symbol.BaseType; current is not null; current = current.BaseType)
        {
            if (SymbolEqualityComparer.Default.Equals(current, baseTypeSymbol))
                return true;
        }

        return false;
    }

    private static void GenerateManifestSource(SourceProductionContext spc, Manifest manifest)
    {
        var manifestJson = BuildManifestJson(manifest).Replace("*/", "*\\/");
        var sb = new StringBuilder();

        sb.AppendLine("// <auto-generated/>");
        sb.AppendLine("#nullable enable");
        sb.AppendLine($"/*{ManifestStartMarker}");
        sb.AppendLine(manifestJson);
        sb.AppendLine($"{ManifestEndMarker}*/");
        sb.AppendLine("namespace PuduLauncher.Generated;");
        sb.AppendLine("internal static class PuduContractManifest");
        sb.AppendLine("{");
        sb.AppendLine("}");

        spc.AddSource("PuduContractManifest.g.cs", sb.ToString());
    }

    private static string BuildManifestJson(Manifest manifest)
    {
        var sb = new StringBuilder();
        sb.Append("{\"version\":");
        sb.Append(manifest.Version);

        sb.Append(",\"controllers\":[");
        for (int i = 0; i < manifest.Controllers.Length; i++)
        {
            if (i > 0)
                sb.Append(',');
            AppendControllerJson(sb, manifest.Controllers[i]);
        }
        sb.Append(']');

        sb.Append(",\"models\":[");
        for (int i = 0; i < manifest.Models.Length; i++)
        {
            if (i > 0)
                sb.Append(',');
            AppendModelJson(sb, manifest.Models[i]);
        }
        sb.Append(']');
        sb.Append('}');
        return sb.ToString();
    }

    private static void AppendControllerJson(StringBuilder sb, ManifestController controller)
    {
        sb.Append("{\"name\":");
        AppendJsonString(sb, controller.Name);
        sb.Append(",\"commands\":[");

        for (int i = 0; i < controller.Commands.Length; i++)
        {
            if (i > 0)
                sb.Append(',');

            var command = controller.Commands[i];
            sb.Append("{\"name\":");
            AppendJsonString(sb, command.Name);
            sb.Append(",\"methodName\":");
            AppendJsonString(sb, command.MethodName);
            sb.Append(",\"parameters\":[");
            for (int j = 0; j < command.Parameters.Length; j++)
            {
                if (j > 0) sb.Append(',');
                var param = command.Parameters[j];
                sb.Append("{\"name\":");
                AppendJsonString(sb, param.Name);
                sb.Append(",\"type\":");
                AppendJsonString(sb, param.Type);
                sb.Append(",\"clrType\":");
                AppendJsonString(sb, param.ClrType);
                sb.Append('}');
            }
            sb.Append(']');
            sb.Append(",\"returnType\":");
            AppendJsonString(sb, command.ReturnType);
            sb.Append(",\"returnClrType\":");
            if (command.ReturnClrType is null)
                sb.Append("null");
            else
                AppendJsonString(sb, command.ReturnClrType);
            sb.Append(",\"isVoid\":");
            sb.Append(command.IsVoid ? "true" : "false");
            sb.Append('}');
        }

        sb.Append("]}");
    }

    private static void AppendModelJson(StringBuilder sb, ModelInfo model)
    {
        sb.Append("{\"name\":");
        AppendJsonString(sb, model.Name);
        sb.Append(",\"typeParameters\":[");
        for (int i = 0; i < model.TypeParameters.Length; i++)
        {
            if (i > 0)
                sb.Append(',');
            AppendJsonString(sb, model.TypeParameters[i]);
        }
        sb.Append(']');
        sb.Append(",\"clrType\":");
        AppendJsonString(sb, model.ClrType);
        sb.Append(",\"baseType\":");
        if (model.BaseType is null)
            sb.Append("null");
        else
            AppendJsonString(sb, model.BaseType);
        sb.Append(",\"eventType\":");
        if (model.EventType is null)
            sb.Append("null");
        else
            AppendJsonString(sb, model.EventType);
        sb.Append(",\"properties\":[");

        for (int i = 0; i < model.Properties.Length; i++)
        {
            if (i > 0)
                sb.Append(',');

            var property = model.Properties[i];
            sb.Append("{\"name\":");
            AppendJsonString(sb, property.Name);
            sb.Append(",\"type\":");
            AppendJsonString(sb, property.Type);
            sb.Append(",\"optional\":");
            sb.Append(property.Optional ? "true" : "false");
            sb.Append('}');
        }

        sb.Append("]}");
    }

    private static void AppendJsonString(StringBuilder sb, string value)
    {
        sb.Append('"');
        foreach (var c in value)
        {
            switch (c)
            {
                case '\\':
                    sb.Append("\\\\");
                    break;
                case '"':
                    sb.Append("\\\"");
                    break;
                case '\b':
                    sb.Append("\\b");
                    break;
                case '\f':
                    sb.Append("\\f");
                    break;
                case '\n':
                    sb.Append("\\n");
                    break;
                case '\r':
                    sb.Append("\\r");
                    break;
                case '\t':
                    sb.Append("\\t");
                    break;
                default:
                    if (char.IsControl(c))
                    {
                        sb.Append("\\u");
                        sb.Append(((int)c).ToString("x4"));
                    }
                    else
                    {
                        sb.Append(c);
                    }
                    break;
            }
        }
        sb.Append('"');
    }

    private static string MapTypeToTypeScript(ITypeSymbol type)
    {
        if (type is IArrayTypeSymbol arrayType)
            return $"{MapTypeToTypeScript(arrayType.ElementType)}[]";

        if (type is INamedTypeSymbol namedType)
        {
            if (namedType.OriginalDefinition.SpecialType == SpecialType.System_Nullable_T &&
                namedType.TypeArguments.Length == 1)
            {
                return $"{MapTypeToTypeScript(namedType.TypeArguments[0])} | null";
            }
        }

        var mapped = MapTypeCore(type);

        if (type.IsReferenceType && type.NullableAnnotation == NullableAnnotation.Annotated)
            return $"{mapped} | null";

        return mapped;
    }

    private static string MapTypeCore(ITypeSymbol type)
    {
        if (type is ITypeParameterSymbol typeParameter)
            return typeParameter.Name;

        switch (type.SpecialType)
        {
            case SpecialType.System_String:
                return "string";
            case SpecialType.System_Boolean:
                return "boolean";
            case SpecialType.System_Single:
            case SpecialType.System_Double:
            case SpecialType.System_Decimal:
            case SpecialType.System_Byte:
            case SpecialType.System_SByte:
            case SpecialType.System_Int16:
            case SpecialType.System_UInt16:
            case SpecialType.System_Int32:
            case SpecialType.System_UInt32:
            case SpecialType.System_Int64:
            case SpecialType.System_UInt64:
                return "number";
            case SpecialType.System_Object:
                return "unknown";
            case SpecialType.System_Void:
                return "void";
        }

        if (type.TypeKind == TypeKind.Enum)
            return "number";

        if (type is INamedTypeSymbol namedType)
        {
            var namespaceName = namedType.ContainingNamespace?.ToDisplayString();

            if (namespaceName == "System")
            {
                if (namedType.Name == "DateTime" || namedType.Name == "DateTimeOffset" || namedType.Name == "Guid")
                    return "string";
            }

            if (namespaceName == "System.Threading.Tasks" && namedType.Name == "Task")
            {
                if (namedType.TypeArguments.Length == 1)
                    return MapTypeToTypeScript(namedType.TypeArguments[0]);
                return "void";
            }

            if (namespaceName == "System.Threading.Tasks" && namedType.Name == "ValueTask")
            {
                if (namedType.TypeArguments.Length == 1)
                    return MapTypeToTypeScript(namedType.TypeArguments[0]);
                return "void";
            }

            if (IsCollectionType(namedType) && namedType.TypeArguments.Length == 1)
            {
                return $"{MapTypeToTypeScript(namedType.TypeArguments[0])}[]";
            }

            if (IsDictionaryType(namedType) && namedType.TypeArguments.Length == 2)
            {
                return $"Record<string, {MapTypeToTypeScript(namedType.TypeArguments[1])}>";
            }

            if (namedType.TypeArguments.Length > 0)
            {
                var args = string.Join(", ", namedType.TypeArguments.Select(MapTypeToTypeScript));
                return $"{namedType.Name}<{args}>";
            }

            return namedType.Name;
        }

        return "unknown";
    }

    private static string? GetJsonAccessor(ITypeSymbol type)
    {
        switch (type.SpecialType)
        {
            case SpecialType.System_String:
                return "GetString()!";
            case SpecialType.System_Boolean:
                return "GetBoolean()";
            case SpecialType.System_Byte:
                return "GetByte()";
            case SpecialType.System_SByte:
                return "GetSByte()";
            case SpecialType.System_Int16:
                return "GetInt16()";
            case SpecialType.System_UInt16:
                return "GetUInt16()";
            case SpecialType.System_Int32:
                return "GetInt32()";
            case SpecialType.System_UInt32:
                return "GetUInt32()";
            case SpecialType.System_Int64:
                return "GetInt64()";
            case SpecialType.System_UInt64:
                return "GetUInt64()";
            case SpecialType.System_Single:
                return "GetSingle()";
            case SpecialType.System_Double:
                return "GetDouble()";
            case SpecialType.System_Decimal:
                return "GetDecimal()";
        }

        if (type is INamedTypeSymbol namedType)
        {
            var ns = namedType.ContainingNamespace?.ToDisplayString();
            if (ns == "System")
            {
                return namedType.Name switch
                {
                    "Guid" => "GetGuid()",
                    "DateTime" => "GetDateTime()",
                    "DateTimeOffset" => "GetDateTimeOffset()",
                    _ => null
                };
            }
        }

        return null;
    }

    private static bool IsCollectionType(INamedTypeSymbol type)
    {
        var typeName = type.ConstructedFrom.ToDisplayString(SymbolDisplayFormat.CSharpErrorMessageFormat);
        return typeName == "System.Collections.Generic.List<T>" ||
               typeName == "System.Collections.Generic.IList<T>" ||
               typeName == "System.Collections.Generic.IEnumerable<T>" ||
               typeName == "System.Collections.Generic.ICollection<T>" ||
               typeName == "System.Collections.Generic.IReadOnlyList<T>" ||
               typeName == "System.Collections.Generic.IReadOnlyCollection<T>" ||
               typeName == "System.Collections.Generic.HashSet<T>" ||
               typeName == "System.Collections.Generic.ISet<T>";
    }

    private static bool IsDictionaryType(INamedTypeSymbol type)
    {
        var typeName = type.ConstructedFrom.ToDisplayString(SymbolDisplayFormat.CSharpErrorMessageFormat);
        return typeName == "System.Collections.Generic.Dictionary<TKey, TValue>" ||
               typeName == "System.Collections.Generic.IDictionary<TKey, TValue>" ||
               typeName == "System.Collections.Generic.IReadOnlyDictionary<TKey, TValue>";
    }

    private static string ToCamelCase(string name)
    {
        if (string.IsNullOrEmpty(name))
            return name;

        return char.ToLowerInvariant(name[0]) + name.Substring(1);
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
        string FullyQualifiedName,
        string ControllerName,
        CommandInfo[] Commands);

    private record ParameterInfo(
        string Name,
        string FullyQualifiedType,
        string TypeTs,
        string? JsonAccessor);

    private record CommandInfo(
        string MethodName,
        string CommandName,
        ParameterInfo[] Parameters,
        string ResultTypeTs,
        string? ResultTypeClr,
        bool IsAsync,
        bool IsVoid);

    private record Manifest(
        int Version,
        ManifestController[] Controllers,
        ModelInfo[] Models);

    private record ManifestController(
        string Name,
        ManifestCommand[] Commands);

    private record ManifestParameter(
        string Name,
        string Type,
        string ClrType);

    private record ManifestCommand(
        string Name,
        string MethodName,
        ManifestParameter[] Parameters,
        string ReturnType,
        string? ReturnClrType,
        bool IsVoid);

    private record ModelInfo(
        string Name,
        string[] TypeParameters,
        string ClrType,
        string? BaseType,
        string? EventType,
        ModelPropertyInfo[] Properties);

    private record ModelPropertyInfo(
        string Name,
        string Type,
        bool Optional);
}
