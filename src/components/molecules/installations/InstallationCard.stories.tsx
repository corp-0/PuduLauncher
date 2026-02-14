import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import InstallationCard from './InstallationCard';

type InstallationCardStoryArgs = ComponentProps<typeof InstallationCard> & {
  showLastPlayedChip: boolean;
  lastPlayedStatus: "Recently Played" | "A while ago";
};

const DAY_MS = 24 * 60 * 60 * 1000;

const getLastPlayedDate = (status: InstallationCardStoryArgs["lastPlayedStatus"]) => {
  const daysAgo = status === "Recently Played" ? 2 : 45;
  return new Date(Date.now() - daysAgo * DAY_MS).toISOString();
};

const meta = {
  component: InstallationCard,
  args: {
    forkName: "UnitystationDevelop",
    buildVersion: "26021410",
    isNewest: false,
    showLastPlayedChip: true,
    lastPlayedStatus: "Recently Played",
  },
  argTypes: {
    isNewest: {
      control: "boolean",
      description: "Show or hide the Newest chip.",
    },
    showLastPlayedChip: {
      control: "boolean",
      description: "Show or hide the Last Played chip.",
    },
    lastPlayedStatus: {
      control: { type: "inline-radio" },
      options: ["Recently Played", "A while ago"],
      description: "Controls the label shown when Last Played chip is enabled.",
    },
    lastPlayedAt: {
      table: { disable: true },
    },
  },
  render: ({ showLastPlayedChip, lastPlayedStatus, ...args }) => (
    <InstallationCard
      {...args}
      lastPlayedAt={showLastPlayedChip ? getLastPlayedDate(lastPlayedStatus) : null}
    />
  ),
} satisfies Meta<InstallationCardStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AWhileAgo: Story = {
  args: {
    lastPlayedStatus: "A while ago",
  },
};

export const WithoutLastPlayed: Story = {
  args: {
    showLastPlayedChip: false,
  },
};

export const NewestBuild: Story = {
  args: {
    isNewest: true,
  },
};

export const LongForkName: Story = {
  args: {
    forkName: "UnitystationDevelop-CI-Nightly-Windows-x64-Experimental",
    lastPlayedStatus: "A while ago",
    isNewest: true,
  },
};
