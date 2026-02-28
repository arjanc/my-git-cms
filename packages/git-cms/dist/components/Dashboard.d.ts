import React from 'react';
import type { PageSchema } from '../types/schemas';
interface DashboardProps {
    onNavigate: (view: 'dashboard' | 'editor' | 'files') => void;
    basePath: string;
    pageSchemas?: PageSchema[];
    onSelectSchema?: (schemaType: string) => void;
    /** When provided, shows a Navigation card on the dashboard */
    onOpenNav?: () => void;
}
export declare function Dashboard({ onNavigate, pageSchemas, onSelectSchema, onOpenNav }: DashboardProps): React.JSX.Element;
export {};
//# sourceMappingURL=Dashboard.d.ts.map