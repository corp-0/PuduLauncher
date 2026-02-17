namespace PuduLauncher.Models.Onboarding;

public class OnboardingStepState
{
    public string StepId { get; set; } = "";
    public OnboardingStepStatus Status { get; set; } = OnboardingStepStatus.Pending;
    public DateTime? SeenAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime? DismissedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
