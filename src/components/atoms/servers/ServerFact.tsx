import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/joy";

export interface ServerFactProps {
    icon: ReactNode;
    value: string;
}

export default function ServerFact(props: ServerFactProps) {
    const { icon, value } = props;

    return (
        <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ "--Icon-fontSize": "var(--joy-fontSize-lg)" }}
        >
            <Box sx={{ display: "flex", alignItems: "center", color: "text.tertiary" }}>
                {icon}
            </Box>
            <Typography level="body-sm" sx={{ color: "text.secondary" }} noWrap title={value}>
                {value}
            </Typography>
        </Stack>
    );
}
