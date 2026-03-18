import React from 'react';
import type { FieldSchema } from '../types/schemas';
interface PagePickerFieldProps {
    /** Used when rendered from BlockEditor — provides label and contentPath */
    field?: FieldSchema;
    /**
     * Explicit list of full content paths to fetch pages from.
     * Takes precedence over field.contentPath.
     * Use when you need pages from multiple directories (e.g. navParent picker).
     */
    contentPaths?: string[];
    value: string;
    onChange: (val: string) => void;
    apiBasePath: string;
    /**
     * Slug of the currently edited page — excluded from the picker list.
     * Prevents a page from selecting itself as a parent or link target.
     */
    excludeSlug?: string;
    placeholder?: string;
}
export declare function PagePickerField({ field, contentPaths, value, onChange, apiBasePath, excludeSlug, placeholder, }: PagePickerFieldProps): React.JSX.Element;
export {};
//# sourceMappingURL=PagePickerField.d.ts.map