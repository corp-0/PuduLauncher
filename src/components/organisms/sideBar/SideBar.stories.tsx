import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { SideBarContextProvider } from "../../../contextProviders/SideBarContextProvider";
import SideBar from "./SideBar";

const meta = {
  title: "Organisms/SideBar",
  component: SideBar,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SideBar>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderAtPath = (path: string) => (
  <MemoryRouter initialEntries={[path]}>
    <SideBarContextProvider>
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', flexDirection: "row", bgcolor: "background.body" }}>
        <SideBar />
        <Box sx={{ flex: 1, bgcolor: "background.surface" }} />
      </Box>
    </SideBarContextProvider>
  </MemoryRouter>
);

export const ServersActive: Story = {
  render: () => renderAtPath("/"),
};

export const NewsActive: Story = {
  render: () => renderAtPath("/news"),
};

export const InstallationsActive: Story = {
  render: () => renderAtPath("/installations"),
};

export const PreferencesActive: Story = {
  render: () => renderAtPath("/preferences"),
};
