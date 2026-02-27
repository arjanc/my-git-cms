import React from 'react';
import type { PageSchema } from '../types/schemas';
interface DashboardProps {
    onNavigate: (view: 'dashboard' | 'editor' | 'files') => void;
    basePath: string;
    pageSchemas?: PageSchema[];
    onSelectSchema?: (schemaType: string) => void;
}
export declare function Dashboard({ onNavigate, pageSchemas, onSelectSchema }: DashboardProps): React.JSX.Element;
export {};
//# sourceMappingURL=Dashboard.d.ts.map