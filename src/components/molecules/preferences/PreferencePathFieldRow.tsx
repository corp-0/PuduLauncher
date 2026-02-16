import { FolderOpen } from "@mui/icons-material";
import { IconButton, Input, Stack } from "@mui/joy";
import { open } from "@tauri-apps/plugin-dialog";
import PreferenceFieldLabel from "../../atoms/preferences/PreferenceFieldLabel";
import PreferenceFieldRow from "./PreferenceFieldRow";

interface PreferencePathFieldRowProps {
    label: string;
    tooltip?: string;
    value: string;
    onChange: (value: string) => void | Promise<void>;
}

export default function PreferencePathFieldRow(props: PreferencePathFieldRowProps) {
    const { label, tooltip, value, onChange } = props;

    return (
        <PreferenceFieldRow>
            <PreferenceFieldLabel label={label} tooltip={tooltip} />
            <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                <Input
                    sx={{ flex: 1 }}
                    value={value}
                    readOnly
                />
                <IconButton
                    variant="outlined"
                    color="neutral"
                    title="Browse folder"
                    onClick={async () => {
                        const selected = await open({
                            directory: true,
                            multiple: false,
                            defaultPath: value || undefined,
                        });
                        if (selected !== null) {
                            await onChange(selected);
                        }
                    }}
                >
                    <FolderOpen />
                </IconButton>
            </Stack>
        </PreferenceFieldRow>
    );
}

