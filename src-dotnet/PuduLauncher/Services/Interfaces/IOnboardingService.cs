using PuduLauncher.Models.Onboarding;

namespace PuduLauncher.Services.Interfaces;

public interface IOnboardingService
{
    List<OnboardingStep> GetPendingSteps();
    Task MarkStepSeenAsync(string stepId);
    Task CompleteStepAsync(string stepId);
    Task DismissStepAsync(string stepId);
}
