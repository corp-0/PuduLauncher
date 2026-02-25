import { Card, Stack, Tooltip, Typography } from "@mui/joy";
import { Change } from "../../../pudu/generated";
import { AutoAwesome, Balance, Build, QuestionMark, RocketLaunch } from "@mui/icons-material";

type ChangeTypeContrained = "FIX" | "NEW" | "IMPROVEMENT" | "BALANCE";


export default function ChangeEntry(props: Change) {
    const { description, author, type } = props;
    const changeType = type as ChangeTypeContrained;

    const getIconByType = () => {
        switch (changeType) {
            case "FIX":
                return <Build sx={{ color: "success", fontSize: "body-lg" }} />;
            case "NEW":
                return <AutoAwesome sx={{ color: "warning.500", fontSize: "body-lg" }} />;
            case "IMPROVEMENT":
                return <RocketLaunch sx={{ color: "white", fontSize: "body-lg" }} />;
            case "BALANCE":
                return <Balance sx={{ color: "warning.500", fontSize: "body-lg" }} />;
            default:
                return <QuestionMark sx={{ color: "text.secondary", fontSize: "body-lg" }} />;
        }
    };

    return (
        <Card variant="soft" invertedColors>
            <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title={type} placement="top">
                    {getIconByType()}
                </Tooltip>
                <Stack>
                    <Typography level="body-md" sx={{ color: "white" }}>{description}</Typography>
                    <Typography level="body-xs" sx={{ color: "text.secondary" }}>By {author}</Typography>
                </Stack>
            </Stack>
        </Card >
    );
}