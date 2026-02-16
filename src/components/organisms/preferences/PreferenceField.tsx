import PreferenceInputFieldRow from "../../molecules/preferences/PreferenceInputFieldRow";
import PreferencePathFieldRow from "../../molecules/preferences/PreferencePathFieldRow";
import PreferenceToggleFieldRow from "../../molecules/preferences/PreferenceToggleFieldRow";
import type { PreferenceFieldSchema } from "../../../pudu/generated";

interface PreferenceFieldProps {
    schema: PreferenceFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void | Promise<void>;
}

export default function PreferenceField(props: PreferenceFieldProps) {
    const { schema, value, onChange } = props;

    switch (schema.component) {
        case "toggle":
            return (
                <PreferenceToggleFieldRow
                    label={schema.label}
                    tooltip={schema.tooltip}
                    value={Boolean(value)}
                    onChange={onChange}
                />
            );

        case "number":
            return (
                <PreferenceInputFieldRow
                    label={schema.label}
                    tooltip={schema.tooltip}
                    type="number"
                    value={(value as number) ?? 0}
                    onChange={onChange}
                />
            );

        case "path":
            return (
                <PreferencePathFieldRow
                    label={schema.label}
                    tooltip={schema.tooltip}
                    value={(value as string) ?? ""}
                    onChange={onChange}
                />
            );

        case "text":
        default:
            return (
                <PreferenceInputFieldRow
                    label={schema.label}
                    tooltip={schema.tooltip}
                    type="text"
                    value={(value as string) ?? ""}
                    onChange={onChange}
                />
            );
    }
}

