import { VideogameAsset } from "@mui/icons-material";
import { Chip, Stack, Typography } from "@mui/joy";

interface ServerCardHeaderProps {
    name: string;
    mode: string;
}

export default function ServerCardHeader(props: ServerCardHeaderProps) {
    const { name, mode } = props;

    return (
        <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
            <Typography level="h3">
                {name}
            </Typography>
            <Chip startDecorator={<VideogameAsset />}>
                <Typography
                    level="body-sm"
                    sx={{ color: "primary.300", fontWeight: "lg", letterSpacing: 0.3 }}
                >
                    Now playing: {mode}
                </Typography>
            </Chip>
        </Stack>
    );
}
