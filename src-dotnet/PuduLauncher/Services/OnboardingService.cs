using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using PuduLauncher.Models.Onboarding;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class OnboardingService : IOnboardingService
{
    private const string StepDefinitionsResourceSuffix = "Resources.onboarding-steps.json";
    private static readonly IReadOnlyList<OnboardingStep> StepDefinitions = LoadStepDefinitions();

    private readonly object _syncRoot = new();
    private readonly string _stateFilePath;
    private readonly ILogger<OnboardingService> _logger;
    private OnboardingState _state;

    public OnboardingService(
        IEnvironmentService environmentService,
        ILogger<OnboardingService> logger)
    {
        _logger = logger;
        _stateFilePath = Path.Combine(environmentService.GetUserdataDirectory(), "onboarding-state.json");

        EnsureStateFileExists();
        _state = ReadState();
    }

    public List<OnboardingStep> GetPendingSteps()
    {
        lock (_syncRoot)
        {
            return StepDefinitions
                .Where(IsStepPendingLocked)
                .OrderBy(step => step.Order)
                .ThenBy(step => step.Id, StringComparer.Ordinal)
                .ToList();
        }
    }

    public Task MarkStepSeenAsync(string stepId)
    {
        lock (_syncRoot)
        {
            OnboardingStepState entry = GetOrCreateStepEntryLocked(stepId);
            if (entry.Status is OnboardingStepStatus.Completed or OnboardingStepStatus.Dismissed)
            {
                return Task.CompletedTask;
            }

            if (entry.SeenAtUtc == null)
            {
                entry.SeenAtUtc = DateTime.UtcNow;
            }

            entry.Status = OnboardingStepStatus.Seen;
            entry.UpdatedAtUtc = DateTime.UtcNow;
            WriteStateLocked();
        }

        return Task.CompletedTask;
    }

    public Task CompleteStepAsync(string stepId)
    {
        lock (_syncRoot)
        {
            OnboardingStepState entry = GetOrCreateStepEntryLocked(stepId);
            entry.Status = OnboardingStepStatus.Completed;
            entry.SeenAtUtc ??= DateTime.UtcNow;
            entry.CompletedAtUtc = DateTime.UtcNow;
            entry.DismissedAtUtc = null;
            entry.UpdatedAtUtc = DateTime.UtcNow;
            WriteStateLocked();
        }

        return Task.CompletedTask;
    }

    public Task DismissStepAsync(string stepId)
    {
        OnboardingStep definition = GetStepDefinition(stepId);
        if (definition.IsRequired)
        {
            throw new InvalidOperationException($"Step '{stepId}' is required and cannot be dismissed.");
        }

        lock (_syncRoot)
        {
            OnboardingStepState entry = GetOrCreateStepEntryLocked(stepId);
            entry.Status = OnboardingStepStatus.Dismissed;
            entry.SeenAtUtc ??= DateTime.UtcNow;
            entry.DismissedAtUtc = DateTime.UtcNow;
            entry.CompletedAtUtc = null;
            entry.UpdatedAtUtc = DateTime.UtcNow;
            WriteStateLocked();
        }

        return Task.CompletedTask;
    }

    private OnboardingStep GetStepDefinition(string stepId)
    {
        if (string.IsNullOrWhiteSpace(stepId))
        {
            throw new ArgumentException("Step id cannot be empty.", nameof(stepId));
        }

        OnboardingStep? definition = StepDefinitions
            .FirstOrDefault(step => step.Id.Equals(stepId, StringComparison.Ordinal));

        return definition ?? throw new KeyNotFoundException($"Unknown onboarding step '{stepId}'.");
    }

    private bool IsStepPendingLocked(OnboardingStep definition)
    {
        OnboardingStepState? state = _state.Steps
            .FirstOrDefault(entry => entry.StepId.Equals(definition.Id, StringComparison.Ordinal));

        if (state == null)
        {
            return true;
        }

        return definition.IsRequired
            ? state.Status != OnboardingStepStatus.Completed
            : state.Status is not OnboardingStepStatus.Completed and not OnboardingStepStatus.Dismissed;
    }

    private OnboardingStepState GetOrCreateStepEntryLocked(string stepId)
    {
        _ = GetStepDefinition(stepId);

        OnboardingStepState? existing = _state.Steps
            .FirstOrDefault(entry => entry.StepId.Equals(stepId, StringComparison.Ordinal));

        if (existing != null)
        {
            return existing;
        }

        var created = new OnboardingStepState
        {
            StepId = stepId,
            Status = OnboardingStepStatus.Pending,
            UpdatedAtUtc = DateTime.UtcNow
        };
        _state.Steps.Add(created);

        return created;
    }

    private void EnsureStateFileExists()
    {
        string? directory = Path.GetDirectoryName(_stateFilePath);
        if (directory != null)
        {
            Directory.CreateDirectory(directory);
        }

        if (File.Exists(_stateFilePath))
        {
            return;
        }

        var defaults = new OnboardingState();
        string json = JsonSerializer.Serialize(defaults, GetStateTypeInfo());
        File.WriteAllText(_stateFilePath, json);
    }

    private OnboardingState ReadState()
    {
        try
        {
            string json = File.ReadAllText(_stateFilePath);
            if (string.IsNullOrWhiteSpace(json))
            {
                return new OnboardingState();
            }

            OnboardingState? parsed = JsonSerializer.Deserialize(json, GetStateTypeInfo());
            if (parsed == null)
            {
                return new OnboardingState();
            }

            parsed.Version = OnboardingState.CurrentVersion;
            parsed.Steps ??= [];
            return parsed;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read onboarding state from {Path}; using defaults", _stateFilePath);
            return new OnboardingState();
        }
    }

    private void WriteStateLocked()
    {
        try
        {
            _state.Version = OnboardingState.CurrentVersion;
            string json = JsonSerializer.Serialize(_state, GetStateTypeInfo());
            File.WriteAllText(_stateFilePath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write onboarding state to {Path}", _stateFilePath);
            throw;
        }
    }

    private static JsonTypeInfo<OnboardingState> GetStateTypeInfo()
    {
        return (JsonTypeInfo<OnboardingState>?)JsonCtx.Default.GetTypeInfo(typeof(OnboardingState))
               ?? throw new InvalidOperationException(
                   "Type OnboardingState is not registered in JsonCtx. Run 'npm run generate-ts'.");
    }

    private static JsonTypeInfo<List<OnboardingStep>> GetStepDefinitionsTypeInfo()
    {
        return (JsonTypeInfo<List<OnboardingStep>>?)JsonCtx.Default.GetTypeInfo(typeof(List<OnboardingStep>))
               ?? throw new InvalidOperationException(
                   "Type List<OnboardingStep> is not registered in JsonCtx. Run 'npm run generate-ts'.");
    }

    private static IReadOnlyList<OnboardingStep> LoadStepDefinitions()
    {
        var assembly = typeof(OnboardingService).Assembly;
        string resourceName = assembly.GetManifestResourceNames()
            .FirstOrDefault(name => name.EndsWith(StepDefinitionsResourceSuffix, StringComparison.Ordinal))
            ?? throw new InvalidOperationException(
                $"Embedded onboarding step definitions not found (suffix: '{StepDefinitionsResourceSuffix}').");

        using Stream resourceStream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded onboarding step definitions stream not found (resource: '{resourceName}').");

        List<OnboardingStep>? parsed = JsonSerializer.Deserialize(resourceStream, GetStepDefinitionsTypeInfo());
        if (parsed is null || parsed.Count == 0)
        {
            throw new InvalidOperationException("Embedded onboarding step definitions are empty or invalid.");
        }

        ValidateStepDefinitions(parsed);

        return parsed
            .OrderBy(step => step.Order)
            .ThenBy(step => step.Id, StringComparer.Ordinal)
            .ToArray();
    }

    private static void ValidateStepDefinitions(IReadOnlyList<OnboardingStep> definitions)
    {
        HashSet<string> stepIds = [];
        HashSet<int> orders = [];

        foreach (OnboardingStep step in definitions)
        {
            if (string.IsNullOrWhiteSpace(step.Id))
            {
                throw new InvalidOperationException("Onboarding step definition contains an empty id.");
            }

            if (string.IsNullOrWhiteSpace(step.ComponentKey))
            {
                throw new InvalidOperationException($"Onboarding step '{step.Id}' has an empty component key.");
            }

            if (!stepIds.Add(step.Id))
            {
                throw new InvalidOperationException($"Duplicate onboarding step id '{step.Id}' in definitions.");
            }

            if (!orders.Add(step.Order))
            {
                throw new InvalidOperationException(
                    $"Duplicate onboarding step order '{step.Order}' in definitions.");
            }
        }
    }
}
