import React from 'react';
import type { BlockSchema, PageSchema } from '../types/schemas';
interface AdminPageProps {
    blockSchemas?: BlockSchema[];
    pageSchemas?: PageSchema[];
}
export default function AdminPage({ blockSchemas, pageSchemas }?: AdminPageProps): Promise<React.FunctionComponentElement<import("..").CMSProps>>;
export {};
//# sourceMappingURL=admin-page.d.ts.map