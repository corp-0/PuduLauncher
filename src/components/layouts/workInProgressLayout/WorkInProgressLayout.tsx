import {AspectRatio, Stack, Typography} from "@mui/joy";

export default function WorkInProgressLayout() {
    return (
        <>
            <Stack height="100%" justifyContent="center" alignItems="center" spacing={4} padding={8}>
                <AspectRatio variant="plain" objectFit="contain" sx={{
                    width: "100%",
                    maxWidth: "50%",
                }}>
                    <img src="/aiPlaceholders/pudu-nap.png" alt="Pudu is having a nap"/>
                </AspectRatio>
                <Typography level="h1">
                    Work in progress...
                </Typography>
            </Stack>
        </>
    )
}
