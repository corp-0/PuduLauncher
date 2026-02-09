import type { Meta, StoryObj } from "@storybook/react-vite";
import WorkInProgressLayout, { workInProgressImagePool } from "./WorkInProgressLayout.tsx";

const imageIndexOptions = workInProgressImagePool.map((_, index) => index);

const meta = {
    title: "Layouts/WorkInProgressLayout",
    component: WorkInProgressLayout,
    parameters: {
        layout: "fullscreen",
    },
    args: {
        imageIndex: 0,
    },
    argTypes: {
        imageIndex: {
            options: imageIndexOptions,
            control: {type: "inline-radio"},
        },
    },
} satisfies Meta<typeof WorkInProgressLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PuduNap: Story = {
    args: {
        imageIndex: 0,
    },
};

export const PuduSnack: Story = {
    args: {
        imageIndex: 1,
    },
};