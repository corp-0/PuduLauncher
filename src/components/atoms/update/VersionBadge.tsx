import { Box, Stack, Typography } from "@mui/joy";

interface VersionBadgeProps {
    currentVersion: string;
    newVersion: string;
}

export default function VersionBadge(props: VersionBadgeProps) {
    const { currentVersion, newVersion } = props;

    return (
        <Stack alignItems="center" spacing={0.5}>
            <Typography
                level="body-xs"
                sx={{ color: "text.tertiary", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}
            >
                Version
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography
                    level="body-sm"
                    sx={{ color: "text.secondary", fontFamily: "monospace" }}
                >
                    {currentVersion}
                </Typography>
                <Box
                    component="span"
                    sx={{
                        display: "inline-block",
                        width: 28,
                        height: 2,
                        borderRadius: 1,
                        background: "linear-gradient(90deg, var(--joy-palette-neutral-600), var(--joy-palette-primary-400))",
                    }}
                />
                <Typography
                    level="body-sm"
                    sx={{
                        color: "primary.300",
                        fontFamily: "monospace",
                        fontWeight: 700,
                    }}
                >
                    {newVersion}
                </Typography>
            </Stack>
        </Stack>
    );
}
