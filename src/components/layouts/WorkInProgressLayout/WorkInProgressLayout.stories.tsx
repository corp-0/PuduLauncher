import type { Meta, StoryObj } from "@storybook/react-vite";
import WorkInProgressLayout from "./WorkInProgressLayout.tsx";

const meta = {
    title: "Layouts/WorkInProgressLayout",
    component: WorkInProgressLayout,
    parameters: {
        layout: "fullscreen",
    },
} satisfies Meta<typeof WorkInProgressLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};