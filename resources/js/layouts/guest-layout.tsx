import GuestLayoutTemplate from '@/layouts/app/guest-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <GuestLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </GuestLayoutTemplate>
);
