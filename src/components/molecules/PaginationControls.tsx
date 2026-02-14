import { Button, Stack, Typography } from "@mui/joy";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function PaginationControls(props: PaginationControlsProps) {
    const { currentPage, totalPages, onPrevious, onNext } = props;

    if (totalPages <= 1) return null;

    return (
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Button
                variant="outlined"
                size="sm"
                disabled={currentPage <= 1}
                onClick={onPrevious}
            >
                Previous
            </Button>
            <Typography level="body-sm">
                Page {currentPage} of {totalPages}
            </Typography>
            <Button
                variant="outlined"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={onNext}
            >
                Next
            </Button>
        </Stack>
    );
}
