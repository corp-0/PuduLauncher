import {
    AspectRatio,
    LinearProgress,
    Sheet,
    Stack,
} from "@mui/joy";
import ServerCardActionButton from "../../molecules/servers/ServerCardActionButton";
import ServerCardDetails from "../../molecules/servers/ServerCardDetails";
import ServerCardHeader from "../../molecules/servers/ServerCardHeader";
import {resolveServerAction} from "../../molecules/servers/serverCardActions";
import type {ServerCardProps} from "./serverCard.types";

export type {
    ServerActionState,
    ServerCardProgress,
    ServerCardProps,
} from "./serverCard.types";

export default function ServerCard(props: ServerCardProps) {
    const {
        name,
        map,
        build,
        mode,
        roundTime,
        playersOnline,
        playerCapacity,
        pingMs,
        iconSrc = "/assets/defaultServerIcon.png",
        actionLabel,
        actionState,
        onActionClick,
        isActionDisabled = false,
        progress = null,
    } = props;

    const {
        resolvedActionState,
        resolvedActionLabel,
        actionVisual,
        isBusyAction,
        isDeterminate
    } = resolveServerAction(actionLabel, actionState);

    const shouldDisableAction = isActionDisabled || isBusyAction;

    const isScanningFailed = resolvedActionState === "scanningFailed";
    const progressPercent = isScanningFailed
        ? 100
        : progress
            ? Math.round(Math.max(0, Math.min(progress.value, 100)))
            : 0;
    const hasProgress = isScanningFailed || (progress !== null && progress !== undefined);

    return (
        <Sheet
            sx={{
                bgcolor: "background.level1",
                borderRadius: "lg",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "sm",
                overflow: "hidden",
            }}
        >
            <Stack spacing={1.25} sx={{p: 1.5}}>
                <Stack direction={{xs: "column", md: "row"}} spacing={1.5} alignItems={{xs: "stretch", md: "center"}}>
                    <AspectRatio
                        variant="plain"
                        ratio="1/1"
                        objectFit="cover"
                        sx={{
                            width: 96,
                            minWidth: 96,
                            borderRadius: "sm",
                            overflow: "hidden",
                            alignSelf: {xs: "center", md: "flex-start"},
                        }}
                    >
                        <img src={iconSrc} alt={`${name} icon`}/>
                    </AspectRatio>

                    <Stack spacing={0.75} sx={{flex: 1, minWidth: 0}}>
                        <ServerCardHeader name={name} mode={mode}/>
                        <ServerCardDetails
                            map={map}
                            build={build}
                            roundTime={roundTime}
                            pingMs={pingMs}
                            playersOnline={playersOnline}
                            playerCapacity={playerCapacity}
                        />
                    </Stack>

                    <Stack spacing={0.75} sx={{width: {xs: "100%", md: 220}, minWidth: {md: 220}}}>
                        <ServerCardActionButton
                            onClick={onActionClick}
                            disabled={shouldDisableAction}
                            color={actionVisual.color}
                            icon={actionVisual.icon}
                            label={resolvedActionLabel}
                        />
                    </Stack>
                </Stack>
            </Stack>

            <LinearProgress
                determinate={isDeterminate}
                variant="soft"
                value={progressPercent}
                color={actionVisual.color}
                sx={{
                    opacity: hasProgress ? 1 : 0,
                    transition: "opacity 0.2s ease",
                }}
            />
        </Sheet>
    );
}
