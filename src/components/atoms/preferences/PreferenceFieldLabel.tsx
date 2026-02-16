import { InfoOutlined } from "@mui/icons-material";
import { FormLabel, IconButton, Stack, Tooltip } from "@mui/joy";

interface PreferenceFieldLabelProps {
    label: string;
    tooltip?: string;
}

export default function PreferenceFieldLabel(props: PreferenceFieldLabelProps) {
    const { label, tooltip } = props;

    return (
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <FormLabel sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.25 }}>{label}</FormLabel>
            {tooltip && (
                <Tooltip title={tooltip} variant="soft" arrow placement="top">
                    <IconButton
                        variant="plain"
                        color="neutral"
                        sx={{
                            "--Icon-fontSize": "0.95rem",
                            p: 0,
                            minWidth: "auto",
                            minHeight: "auto",
                            transform: "translateY(-1px)",
                        }}
                    >
                        <InfoOutlined />
                    </IconButton>
                </Tooltip>
            )}
        </Stack>
    );
}
