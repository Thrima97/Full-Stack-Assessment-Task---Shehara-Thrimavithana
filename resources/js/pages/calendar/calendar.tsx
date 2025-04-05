import Calendar from '@/components/calendar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar View',
        href: '/dashboard',
    },
];

interface SeatOption {
    label: string;
    value: number;
}

export default function Dashboard({ seatCounts }: { seatCounts: SeatOption[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar View" />
            <Calendar seatCounts={seatCounts} />
        </AppLayout>
    );
}
