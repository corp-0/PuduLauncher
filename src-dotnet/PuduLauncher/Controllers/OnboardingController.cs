using PuduLauncher.Abstractions.Attributes;
using PuduLauncher.Models.Onboarding;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Controllers;

[PuduController("onboarding")]
public class OnboardingController(IOnboardingService onboardingService)
{
    [PuduCommand]
    public List<OnboardingStep> GetPendingSteps()
    {
        return onboardingService.GetPendingSteps();
    }

    [PuduCommand]
    public async Task MarkStepSeen(string stepId)
    {
        await onboardingService.MarkStepSeenAsync(stepId);
    }

    [PuduCommand]
    public async Task CompleteStep(string stepId)
    {
        await onboardingService.CompleteStepAsync(stepId);
    }

    [PuduCommand]
    public async Task DismissStep(string stepId)
    {
        await onboardingService.DismissStepAsync(stepId);
    }
}
