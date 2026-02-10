import { Inventory2, RocketLaunch, Timer, Wifi } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/joy";
import ServerFact from "../../atoms/servers/ServerFact";
import ServerPopulationStat from "../../atoms/servers/ServerPopulationStat";

interface ServerCardDetailsProps {
    map: string;
    build: string;
    roundTime: string;
    pingMs: number;
    playersOnline: number;
    playerCapacity: number;
}

export default function ServerCardDetails(props: ServerCardDetailsProps) {
    const {
        map,
        build,
        roundTime,
        pingMs,
        playersOnline,
        playerCapacity,
    } = props;

    return (
        <Stack direction="row" spacing={4}>
            <Stack justifyContent="center">
                <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    sx={{ minWidth: 0, "--Icon-fontSize": "var(--joy-fontSize-lg)" }}
                >
                    <RocketLaunch sx={{ color: "text.secondary" }} />
                    <Typography level="body-md" sx={{ color: "text.secondary", minWidth: 0 }} noWrap title={map}>
                        {map}
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.25,
                    }}
                >
                    <ServerFact icon={<Inventory2 />} value={`Build ${build}`} />
                    <ServerFact icon={<Timer />} value={roundTime} />
                    <ServerFact icon={<Wifi />} value={`${pingMs} ms`} />
                </Box>
            </Stack>

            <ServerPopulationStat playersOnline={playersOnline} playerCapacity={playerCapacity} />
        </Stack>
    );
}
