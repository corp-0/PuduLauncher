import { Box, Typography } from "@mui/joy";

export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography level="h3" sx={{ mb: 2 }}>
                {title}
            </Typography>
            {children}
        </Box>
    );
}
