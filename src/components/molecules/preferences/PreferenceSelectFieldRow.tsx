import { Option, Select } from "@mui/joy";
import PreferenceFieldLabel from "../../atoms/preferences/PreferenceFieldLabel";
import PreferenceFieldRow from "./PreferenceFieldRow";

interface PreferenceSelectFieldRowProps {
    label: string;
    tooltip?: string;
    value: string;
    options: string[];
    onChange: (value: string) => void | Promise<void>;
}

export default function PreferenceSelectFieldRow(props: PreferenceSelectFieldRowProps) {
    const { label, tooltip, value, options, onChange } = props;

    return (
        <PreferenceFieldRow>
            <PreferenceFieldLabel label={label} tooltip={tooltip} />
            <Select
                sx={{ mt: 0.75 }}
                value={value || null}
                placeholder={options.length > 0 ? "Select an option" : "No options available"}
                disabled={options.length === 0}
                slotProps={{
                    listbox: {
                        placement: "bottom-start",
                        popperOptions: {
                            strategy: "fixed",
                        },
                        modifiers: [
                            {
                                name: "preventOverflow",
                                options: {
                                    boundary: "viewport",
                                    padding: 8,
                                },
                            },
                        ],
                        sx: {
                            maxHeight: "min(320px, calc(100vh - 16px))",
                            overflow: "auto",
                        },
                    },
                }}
                onChange={(_event, newValue) => {
                    if (typeof newValue === "string") {
                        onChange(newValue);
                    }
                }}
            >
                {options.map((option) => (
                    <Option key={option} value={option}>
                        {option}
                    </Option>
                ))}
            </Select>
        </PreferenceFieldRow>
    );
}
