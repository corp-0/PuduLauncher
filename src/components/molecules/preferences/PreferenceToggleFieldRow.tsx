import { Switch } from "@mui/joy";
import PreferenceFieldLabel from "../../atoms/preferences/PreferenceFieldLabel";
import PreferenceFieldRow from "./PreferenceFieldRow";

interface PreferenceToggleFieldRowProps {
    label: string;
    tooltip?: string;
    value: boolean;
    onChange: (value: boolean) => void | Promise<void>;
}

export default function PreferenceToggleFieldRow(props: PreferenceToggleFieldRowProps) {
    const { label, tooltip, value, onChange } = props;

    return (
        <PreferenceFieldRow
            orientation="horizontal"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
            <PreferenceFieldLabel label={label} tooltip={tooltip} />
            <Switch
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
        </PreferenceFieldRow>
    );
}
