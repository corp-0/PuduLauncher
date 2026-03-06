import { Card, Chip, Stack, Typography } from "@mui/joy";
import { ChangelogEntry } from "../../../pudu/generated";
import ChangeEntry from "../../atoms/news/ChangeEntry";
import { formatRelative, isValid, parseISO } from "date-fns";

function humanizeDate(isoDate: string | null | undefined): string {
    if (!isoDate) {
        return "Unknown date";
    }
    const parsed = parseISO(isoDate);
    if (!isValid(parsed)) {
        return "Unknown date";
    }
    return formatRelative(parsed, new Date());
}

export default function BuildEntry(props: ChangelogEntry) {
    const { version, dateCreated, changes } = props;

    return (
        <Card
            variant="soft"
            size="sm"
            sx={{
                borderLeft: "3px solid",
                borderColor: "primary.500",
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip size="sm" variant="solid" color="primary">
                            v{version}
                        </Chip>
                        <Chip size="sm" variant="outlined" color="neutral">
                            {changes.length}
                        </Chip>
                    </Stack>
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {humanizeDate(dateCreated)}
                    </Typography>
                </Stack>

                <Stack spacing={1}>
                    {changes.map((change, index) => (
                        <ChangeEntry key={index} {...change} />
                    ))}
                    {changes.length === 0 && (
                        <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                            No changes listed. Probably internal fixes.
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Card>
    );
}
