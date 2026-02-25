import { Alert, Card, Stack, Typography } from "@mui/joy";
import { ChangelogEntry } from "../../../pudu/generated";
import ChangeEntry from "../../atoms/news/ChangeEntry";
import { formatRelative, isValid, parseISO } from "date-fns";

export default function BuildEntry(props: ChangelogEntry) {
    const { version, dateCreated, changes } = props;

    const humanizeDate = (isoDate: string | null | undefined) => {
        if (!isoDate) {
            return "Unknown date";
        }

        const parsed = parseISO(isoDate);
        if (!isValid(parsed)) {
            return "Unknown date";
        }

        return formatRelative(parsed, new Date());
    }

    return (
        <Card>
            <Stack spacing={2}>
                <Stack>
                    <Typography>
                        Version {version}
                    </Typography>
                    <Typography level="body-xs">
                        {humanizeDate(dateCreated)}
                    </Typography>
                </Stack>
            </Stack>
            <Stack spacing={2}>
                {changes.map((change, index) => (
                    <ChangeEntry key={index} {...change} />
                ))}
                {changes.length === 0 && (
                    <Alert color="neutral" variant="soft">
                        <Typography level="body-sm">
                            This build has no changes listed. It is probably a bunch of internal fixes.
                        </Typography>
                    </Alert>)}
            </Stack>
        </Card>
    );
}
