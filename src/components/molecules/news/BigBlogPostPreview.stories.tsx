import type { Meta, StoryObj } from '@storybook/react-vite';

import BigBlogPostPreview from './BigBlogPostPreview';

const meta = {
  component: BigBlogPostPreview,
} satisfies Meta<typeof BigBlogPostPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "title": "Progress #33: It's been a while!",
    "slug": "progress-33-its-been-a-while",
    "author": "Gilles",
    "createDateTime": "2025-05-03T03:07:24.470778Z",
    "type": "weekly",
    "imageUrl": "https://unitystationfile.b-cdn.net/WeeklyBlogUpdates/33/sillylights.webp",
    "summary": "New mobs use the same systems as players, simple bots are back and talky, puddles are real, traps are live, emissive lights got cooler, and Linux builds finally work. We’ve got a new permissions system, character voices, a flatpacking machine, speech-to-text, and a mountain of bugfixes. It's been a big one.",
    "state": "published",
  },
};