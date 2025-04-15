import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart2, CalendarDays, ClipboardList, FileEdit, LayoutDashboard, Package, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const adminNavItems: NavItem[] = [
        {
            title: 'Calendar View',
            href: '/admin/calendar-view',
            icon: CalendarDays,
        },
        {
            title: 'Booking Management',
            href: '/admin/booking-management',
            icon: ClipboardList,
        },
        {
            title: 'User Management',
            href: '/admin/user-management',
            icon: Users,
        },
        {
            title: 'Package Management',
            href: '/admin/package-management',
            icon: Package,
        },
        {
            title: 'Reports & Analytics',
            href: '/admin/reports-and-analytics',
            icon: BarChart2,
        },
    ];

    const userNavItems: NavItem[] = [
        {
            title: 'Calendar View',
            href: '/user/calendar-view',
            icon: CalendarDays,
        },
        {
            title: 'Booking Form',
            href: '/user/booking-form',
            icon: FileEdit,
        },
        {
            title: 'Dashboard',
            href: '/user/dashboard',
            icon: LayoutDashboard,
        },
    ];

    const mainNavItems = auth.is_admin ? adminNavItems : userNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
