import { FolderOpen } from "@mui/icons-material";
import { FormControl, FormLabel, IconButton, Input, Stack, Switch, Tooltip } from "@mui/joy";
import { open } from "@tauri-apps/plugin-dialog";
import type { ReactElement } from "react";
import type { PreferenceFieldSchema } from "../../../pudu/generated";

interface PreferenceFieldProps {
    schema: PreferenceFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void | Promise<void>;
}

export default function PreferenceField(props: PreferenceFieldProps) {
    const { schema, value, onChange } = props;
    const label = <FormLabel>{schema.label}</FormLabel>;
    const withTooltip = (content: ReactElement) => (
        schema.tooltip
            ? (
                <Tooltip title={schema.tooltip} variant="soft" arrow placement="top-start">
                    <div>{content}</div>
                </Tooltip>
            )
            : content
    );

    switch (schema.component) {
        case "toggle":
            return withTooltip(
                <FormControl orientation="horizontal" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    {label}
                    <Switch
                        checked={Boolean(value)}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                </FormControl>
            );

        case "number":
            return withTooltip(
                <FormControl>
                    {label}
                    <Input
                        type="number"
                        value={value as number ?? 0}
                        onChange={(e) => {
                            const parsed = Number(e.target.value);
                            if (Number.isFinite(parsed)) {
                                onChange(parsed);
                            }
                        }}
                    />
                </FormControl>
            );

        case "path":
            return withTooltip(
                <FormControl>
                    {label}
                    <Stack direction="row" spacing={1}>
                        <Input
                            sx={{ flex: 1 }}
                            value={(value as string) ?? ""}
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
                                    defaultPath: (value as string) || undefined,
                                });
                                if (selected !== null) {
                                    await onChange(selected);
                                }
                            }}
                        >
                            <FolderOpen />
                        </IconButton>
                    </Stack>
                </FormControl>
            );

        case "text":
        default:
            return withTooltip(
                <FormControl>
                    {label}
                    <Input
                        value={(value as string) ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </FormControl>
            );
    }
}
