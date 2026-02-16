import type { ReactNode } from "react";
import { Button } from "@mui/joy";

interface ServerCardActionButtonProps {
    color: "warning" | "primary" | "neutral" | "danger" | "success";
    icon: ReactNode;
    label: string;
    disabled: boolean;
    onClick?: () => void;
}

export default function ServerCardActionButton(props: ServerCardActionButtonProps) {
    const { color, icon, label, disabled, onClick } = props;

    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            color={color}
            variant="solid"
            size="lg"
            startDecorator={icon}
            sx={{
                width: "100%",
                fontWeight: "lg",
                minHeight: 44,
            }}
        >
            {label}
        </Button>
    );
}
