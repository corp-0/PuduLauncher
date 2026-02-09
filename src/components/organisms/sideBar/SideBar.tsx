import {
    Divider,
    List,
    Stack, Typography
} from "@mui/joy";
import SideBarMenuItem from "../../molecules/sideBar/SideBarMenuItem.tsx";
import SideBarExternalLink from "../../molecules/sideBar/SideBarExternalLink.tsx";
import { useSideBarContext } from "../../../contextProviders/SideBarContextProvider.tsx";

export default function SideBar() {
    const { menuItems, externalLinks } = useSideBarContext();

    return (
        <Stack alignItems="center" justifyContent="space-between" direction="column" spacing={2} padding={1}
            sx={{
                bgcolor: "background.body",
                height: '100%',
                minWidth: 240,
                flex: "0 0 clamp(240px, 18vw, 340px)",
            }}>
            <Stack direction="column" alignItems="center" spacing={2}>
                <Typography level="title-lg">Pudu Launcher</Typography>
                <Typography level="body-sm" sx={{ color: "text.secondary", mt: 0.5 }}>
                    Alternative Unitystation Launcher
                </Typography>
                <Divider />
            </Stack>
            <List sx={{ width: '100%', gap: 1 }}>
                {menuItems.map((item) => (
                    <SideBarMenuItem
                        key={item.text}
                        icon={item.icon}
                        text={item.text}
                        isActive={item.isActive}
                        onClick={item.onClick}
                    />
                ))}
            </List>
            <Divider />
            <Stack direction="row" spacing={2} paddingBottom={1}>
                {externalLinks.map((link) => (
                    <SideBarExternalLink
                        key={link.tooltip}
                        tooltip={link.tooltip}
                        icon={link.icon}
                        onClick={link.onClick}
                    />
                ))}
            </Stack>
        </Stack>
    );
}
