import { Box, GlobalStyles } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { OnboardingStep } from "../../../pudu/generated";
import { MockOnboardingProvider } from "../../../storybook/mockProviders";

interface OnboardingPreviewProps {
  steps: OnboardingStep[];
}

function OnboardingPreview(props: OnboardingPreviewProps) {
  const { steps } = props;

  return (
    <MockOnboardingProvider pendingSteps={steps}>
      <Box sx={{ minHeight: "100dvh", width: "100%" }} />
    </MockOnboardingProvider>
  );
}

const meta = {
  title: "Layouts/Onboarding/FirstTimeLaunch",
  component: OnboardingPreview,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <>
        <GlobalStyles
          styles={{
            "html, body, #storybook-root": {
              backgroundColor: "background.surface",
            },
          }}
        />
        <Story />
      </>
    ),
  ],
} satisfies Meta<typeof OnboardingPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const singleStepMock: OnboardingStep[] = [
  {
    id: "welcome",
    componentKey: "welcome",
    title: "Welcome",
    description: "Let's set up your launcher experience.",
    isRequired: true,
    order: 0,
  }
];

const multiStepMock: OnboardingStep[] = [
  {
    id: "welcome",
    componentKey: "welcome",
    title: "Welcome",
    description: "Let's set up your launcher experience.",
    isRequired: true,
    order: 0,
  },
  {
    id: "launcher-basics",
    componentKey: "launcher-basics",
    title: "Launcher basics",
    description: "Quick overview of launcher preferences.",
    isRequired: false,
    order: 1,
  },
  {
    id: "ready-v1",
    componentKey: "all-ready",
    title: "You're ready",
    description: "Final confirmation step.",
    isRequired: true,
    order: 2,
  },
];

export const SingleStepFlow: Story = {
  args: {
    steps: singleStepMock,
  },
}

export const MultiStepFlow: Story = {
  args: {
    steps: multiStepMock,
  },
};
