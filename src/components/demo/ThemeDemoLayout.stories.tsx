import type { Meta, StoryObj } from '@storybook/react-vite';

import ThemeDemoLayout from './ThemeDemoLayout';

const meta = {
  component: ThemeDemoLayout,
} satisfies Meta<typeof ThemeDemoLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};