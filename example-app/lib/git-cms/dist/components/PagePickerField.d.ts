import React from 'react';
import type { FieldSchema } from '../types/schemas';
interface PagePickerFieldProps {
    field: FieldSchema;
    value: string;
    onChange: (val: string) => void;
    apiBasePath: string;
}
export declare function PagePickerField({ field, value, onChange, apiBasePath }: PagePickerFieldProps): React.JSX.Element;
export {};
//# sourceMappingURL=PagePickerField.d.ts.map