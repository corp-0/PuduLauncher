namespace PuduLauncher.Models.Onboarding;

public class OnboardingStep
{
    public string Id { get; set; } = "";
    public string ComponentKey { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public bool IsRequired { get; set; } = true;
    public int Order { get; set; }
}
