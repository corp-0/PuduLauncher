import type { Meta, StoryObj } from '@storybook/react-vite';

import ChangeEntry from './ChangeEntry';

const meta = {
  component: ChangeEntry,
} satisfies Meta<typeof ChangeEntry>;

export default meta;

type Story = StoryObj<typeof meta>;

export const New: Story = {
  "args": {
    "description": "Added something super awesome!",
    "author": "John Doe",
    "type": "NEW"
  }
};

export const Fix: Story = {
  "args": {
    "description": "Fixed a bug where the application would crash on startup.",
    "author": "John Doe",
    "type": "FIX"
  }
};

export const Improvement: Story = {
  "args": {
    "description": "Improved performance of the application.",
    "author": "John Doe",
    "type": "IMPROVEMENT"
  }
};
export const Balance: Story = {
  "args": {
    "description": "Balanced gameplay mechanics.",
    "author": "John Doe",
    "type": "BALANCE"
  }
};