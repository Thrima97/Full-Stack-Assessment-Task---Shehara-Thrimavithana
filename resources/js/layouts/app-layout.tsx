import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
    const { props } = usePage();
    const isAdmin = props.auth?.is_admin;

    const LayoutComponent = isAdmin ? AppSidebarLayout : AppHeaderLayout;

    return <LayoutComponent breadcrumbs={breadcrumbs}>{children}</LayoutComponent>;
}
