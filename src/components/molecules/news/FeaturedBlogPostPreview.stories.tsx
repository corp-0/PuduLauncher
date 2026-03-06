import type { Meta, StoryObj } from '@storybook/react-vite';

import FeaturedBlogPostPreview from './FeaturedBlogPostPreview';

const meta = {
    component: FeaturedBlogPostPreview,
} satisfies Meta<typeof FeaturedBlogPostPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: "Progress #33: It's been a while!",
        slug: "progress-33-its-been-a-while",
        author: "Gilles",
        createDateTime: "2025-05-03T03:07:24.470778Z",
        imageUrl: "https://unitystationfile.b-cdn.net/WeeklyBlogUpdates/33/sillylights.webp",
        summary: "New mobs use the same systems as players, simple bots are back and talky, puddles are real, traps are live, emissive lights got cooler, and Linux builds finally work. We've got a new permissions system, character voices, a flatpacking machine, speech-to-text, and a mountain of bugfixes. It's been a big one.",
    },
};

export const LongSummary: Story = {
    args: {
        title: "Major Update: Complete Overhaul of Game Systems",
        slug: "major-update-complete-overhaul",
        author: "TeamLead",
        createDateTime: "2025-04-15T10:30:00Z",
        imageUrl: "https://unitystationfile.b-cdn.net/WeeklyBlogUpdates/33/sillylights.webp",
        summary: "This update brings a complete overhaul of the core game systems including networking, physics, rendering, and AI. We have rewritten the entire networking stack to support better latency and more concurrent players. The physics engine now handles complex interactions between objects more realistically. Our rendering pipeline has been optimized for lower-end hardware while maintaining visual fidelity on high-end systems.",
    },
};
