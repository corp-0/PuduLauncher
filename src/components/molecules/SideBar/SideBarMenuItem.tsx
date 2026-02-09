import { type JSX } from "react";
import { ListItemButton, ListItemContent, Typography } from "@mui/joy";

export interface SideBarMenuItemProps {
    icon: JSX.Element;
    text: string;
    isActive: boolean;
    onClick: () => void;
}

export default function SideBarMenuItem(props: SideBarMenuItemProps) {
    const { icon, text, isActive, onClick } = props;

    return (
        <ListItemButton selected={isActive} onClick={onClick}>
            {icon}
            <ListItemContent>
                <Typography level="body-lg">
                    {text}
                </Typography>
            </ListItemContent>
        </ListItemButton>
    )
}
