import { Input } from "@mui/joy";
import PreferenceFieldLabel from "../../atoms/preferences/PreferenceFieldLabel";
import PreferenceFieldRow from "./PreferenceFieldRow";

interface PreferenceInputFieldRowProps {
    label: string;
    tooltip?: string;
    value: string | number;
    type: "text" | "number";
    onChange: (value: string | number) => void | Promise<void>;
}

export default function PreferenceInputFieldRow(props: PreferenceInputFieldRowProps) {
    const { label, tooltip, value, type, onChange } = props;

    return (
        <PreferenceFieldRow>
            <PreferenceFieldLabel label={label} tooltip={tooltip} />
            <Input
                sx={{ mt: 0.75 }}
                type={type}
                value={value}
                onChange={(e) => {
                    if (type === "number") {
                        const parsed = Number(e.target.value);
                        if (Number.isFinite(parsed)) {
                            onChange(parsed);
                        }
                        return;
                    }

                    onChange(e.target.value);
                }}
            />
        </PreferenceFieldRow>
    );
}
