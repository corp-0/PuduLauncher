import type { Meta, StoryObj } from '@storybook/react-vite';

import ChangelogSidebar from './ChangelogSidebar';

const meta = {
    component: ChangelogSidebar,
    decorators: [
        (Story) => (
            <div style={{ height: 600 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChangelogSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        isLoading: false,
        isEmpty: false,
        entries: [
            {
                version: "0.8.3",
                dateCreated: "2025-06-01T12:00:00Z",
                changes: [
                    { description: "Fixed a critical networking bug that caused disconnections during high player counts.", author: "Jane Doe", type: "FIX" },
                    { description: "Added new emote system with over 30 animations.", author: "John Smith", type: "NEW" },
                ],
            },
            {
                version: "0.8.2",
                dateCreated: "2025-05-20T10:00:00Z",
                changes: [
                    { description: "Improved server browser loading speed by caching DNS lookups and reusing HTTP connections.", author: "Alice Johnson", type: "IMPROVEMENT" },
                    { description: "Balanced traitor objectives to be more achievable for new players while keeping experienced players challenged.", author: "Bob Brown", type: "BALANCE" },
                    { description: "Fixed ghost players being able to interact with physical objects in certain edge cases.", author: "Jane Doe", type: "FIX" },
                ],
            },
            {
                version: "0.8.1",
                dateCreated: "2025-05-10T08:00:00Z",
                changes: [
                    { description: "Added speech-to-text integration for accessibility.", author: "Charlie Wilson", type: "NEW" },
                    { description: "Fixed Linux builds failing to launch on Ubuntu 24.04.", author: "Jane Doe", type: "FIX" },
                    { description: "Improved character creation UI responsiveness.", author: "Alice Johnson", type: "IMPROVEMENT" },
                    { description: "Fixed inventory duplication exploit when disconnecting during transfers.", author: "Bob Brown", type: "FIX" },
                ],
            },
        ],
    },
};

export const Loading: Story = {
    args: {
        isLoading: true,
        isEmpty: false,
        entries: [],
    },
};

export const Empty: Story = {
    args: {
        isLoading: false,
        isEmpty: true,
        entries: [],
    },
};
