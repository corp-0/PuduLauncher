import { Box, Typography } from "@mui/joy";
import Markdown from "react-markdown";

interface ReleaseNotesCardProps {
    content: string;
}

export default function ReleaseNotesCard(props: ReleaseNotesCardProps) {
    const { content } = props;

    return (
        <Box sx={{
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.surface",
            maxHeight: 220,
            overflow: "auto",
            position: "relative",
        }}>
            <Box sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                px: 2,
                py: 1,
                bgcolor: "background.surface",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}>
                <Typography
                    level="title-sm"
                    sx={{ color: "text.secondary", letterSpacing: "0.03em" }}
                >
                    What's new
                </Typography>
            </Box>
            <Box sx={{
                px: 2,
                py: 1.5,
                fontSize: "sm",
                color: "text.secondary",
                "& h2": {
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "text.primary",
                    mt: 1.5,
                    mb: 0.5,
                },
                "& p": { m: 0, lineHeight: 1.6 },
                "& ul, & ol": { m: 0, pl: 2.5 },
                "& li": { mb: 0.3 },
                "& a": { color: "primary.300", textDecoration: "none" },
                "& a:hover": { textDecoration: "underline" },
                "& strong": { color: "text.primary" },
            }}>
                <Markdown>{content}</Markdown>
            </Box>
        </Box>
    );
}
