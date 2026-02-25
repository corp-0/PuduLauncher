import type { Meta, StoryObj } from '@storybook/react-vite';

import BuildEntry from './BuildEntry';

const meta = {
  component: BuildEntry,
} satisfies Meta<typeof BuildEntry>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "version": "1.0.0",
    "dateCreated": "2024-06-01T12:00:00Z",
    "changes": [
      {
        "description": "Fixed a critical bug that caused crashes on startup.",
        "author": "Jane Doe",
        "type": "FIX"
      },
      {
        "description": "Added new feature for customizing user interface.",
        "author": "John Smith",
        "type": "NEW"
      },
      {
        "description": "Improved performance of the application.",
        "author": "Alice Johnson",
        "type": "IMPROVEMENT"
      },
      {
        "description": "Balanced the game mechanics for better gameplay experience.",
        "author": "Bob Brown",
        "type": "BALANCE"
      }
    ]
  }
};