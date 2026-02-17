namespace PuduLauncher.Models.Onboarding;

public class OnboardingState
{
    public const int CurrentVersion = 1;

    public int Version { get; set; } = CurrentVersion;
    public List<OnboardingStepState> Steps { get; set; } = [];
}
