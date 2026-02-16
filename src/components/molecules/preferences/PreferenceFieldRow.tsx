import { FormControl } from "@mui/joy";
import type { ReactNode } from "react";

interface PreferenceFieldRowProps {
    children: ReactNode;
    orientation?: "horizontal" | "vertical";
    sx?: Record<string, unknown>;
}

export default function PreferenceFieldRow(props: PreferenceFieldRowProps) {
    const { children, orientation, sx } = props;

    return (
        <FormControl
            orientation={orientation}
            sx={{
                px: 1.25,
                py: 1,
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.level1",
                ...sx,
            }}
        >
            {children}
        </FormControl>
    );
}
