import {AspectRatio, Stack, Typography} from "@mui/joy";
import {useState} from "react";

type PlaceholderImage = {
    src: string;
    alt: string;
};

export const workInProgressImagePool: readonly PlaceholderImage[] = [
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

function pickByIndex<T>(items: readonly T[], index: number): T {
    if (items.length === 0) {
        throw new Error("pickByIndex requires at least one item");
    }

    const safeIndex = ((Math.trunc(index) % items.length) + items.length) % items.length;
    return items[safeIndex];
}

type WorkInProgressLayoutProps = {
    imageIndex?: number;
};

export default function WorkInProgressLayout(props: WorkInProgressLayoutProps) {
    const {imageIndex} = props;
    const [randomImage] = useState(() => pickRandom(workInProgressImagePool));
    const selectedImage = imageIndex === undefined
        ? randomImage
        : pickByIndex(workInProgressImagePool, imageIndex);

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
