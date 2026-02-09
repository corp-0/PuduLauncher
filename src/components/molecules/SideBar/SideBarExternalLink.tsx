import {Avatar, Tooltip} from "@mui/joy";
import {type JSX} from "react";

export interface SideBarExternalLinkProps {
    tooltip: string;
    icon: JSX.Element;
    onClick: () => void;
}

export default function SideBarExternalLink(props: SideBarExternalLinkProps) {
    const {tooltip, icon, onClick} = props;

    return (
        <Tooltip title={tooltip} variant="soft" arrow placement="top">
            <Avatar
                onClick={onClick}
                sx={{
                    cursor: "pointer",
                    transition: "background-color .2s, color .2s",
                    bgcolor: "neutral.800",
                    "&:hover": {
                        bgcolor: "neutral.100",
                        color: "primary.plainColor",
                    },
                }}
            >
                {icon}
            </Avatar>
        </Tooltip>
    )
}
