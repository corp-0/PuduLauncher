import {AspectRatio, Stack, Typography} from "@mui/joy";
import {useState} from "react";

type PlaceholderImage = {
    src: string;
    alt: string;
};

const imagePool: PlaceholderImage[] = [
    {
        src: "/aiPlaceholders/pudu-nap.png",
        alt: "Pudu taking a nap",
    },
    {
        src: "/aiPlaceholders/pudu-maqui.png",
        alt: "Pudu having a snack",
    },
];

function pickRandom<T>(items: readonly T[]): T {
    if (items.length === 0) {
        throw new Error("pickRandom requires at least one item");
    }

    return items[Math.floor(Math.random() * items.length)];
}

export default function WorkInProgressLayout() {
    const [selectedImage] = useState(() => pickRandom(imagePool));

    return (
        <>
            <Stack height="100%" justifyContent="center" alignItems="center" spacing={4} padding={8}>
                <AspectRatio variant="plain" objectFit="contain" sx={{
                    width: "100%",
                    maxWidth: "50%",
                }}>
                    <img src={selectedImage.src} alt={selectedImage.alt}/>
                </AspectRatio>
                <Typography level="h1">
                    Work in progress...
                </Typography>
            </Stack>
        </>
    )
}
