import { People } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/joy";

interface ServerPopulationStatProps {
    playersOnline: number;
    playerCapacity: number;
}

export default function ServerPopulationStat(props: ServerPopulationStatProps) {
    const { playersOnline, playerCapacity } = props;

    return (
        <Box sx={{ bgcolor: "background.level2", borderRadius: "sm", padding: 1.25 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <People />
                <Typography level="title-lg" sx={{ color: "text.secondary" }}>
                    {playersOnline} / {playerCapacity}
                </Typography>
            </Stack>
        </Box>
    );
}
