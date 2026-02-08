import React from 'react';
interface DashboardProps {
    onNavigate: (view: 'dashboard' | 'editor' | 'files') => void;
    basePath: string;
}
export declare function Dashboard({ onNavigate, basePath }: DashboardProps): React.JSX.Element;
export {};
//# sourceMappingURL=Dashboard.d.ts.map