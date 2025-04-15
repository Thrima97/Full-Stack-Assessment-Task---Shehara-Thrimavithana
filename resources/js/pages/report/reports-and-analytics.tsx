import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports & Analytics', href: '/reports-and-analytics' }];

interface Booking {
    id: number;
    start_date: string;
    end_date: string;
    price: string;
}

interface Package {
    id: number;
    name: string;
    seat: number;
    description: string;
    bookings: Booking[];
}

interface Props {
    packages: Package[];
}

export default function Dashboard({ packages }: Props) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filter = () => {
        router.get(
            '/admin/reports-and-analytics',
            {
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />
            <h1 className="mx-4 mt-5 text-2xl font-bold text-white">📊 Reports & Analytics</h1>

            {/* Date Range Filter */}
            <div className="mx-4 mt-4 mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <input
                    type="date"
                    className="w-full rounded border px-3 py-2 text-sm text-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    className="w-full rounded border px-3 py-2 text-sm text-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button onClick={filter} className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Apply Filters
                </button>
            </div>

            {/* Results */}
            <div className="mx-4 mb-4">
                {packages.length === 0 ? (
                    <p className="text-center text-gray-300">No packages data</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => {
                            const total = pkg.bookings.reduce((sum, b) => sum + parseFloat(b.price), 0);

                            return (
                                <div key={pkg.id} className="rounded border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {pkg.name} <span className="text-sm text-gray-500">({pkg.seat} seats)</span>
                                    </h2>
                                    <p className="text-sm text-gray-500">{pkg.description}</p>

                                    <p className="mt-3 font-semibold text-green-700">
                                        Total Revenue: <span className="font-bold">LKR {total.toLocaleString()}</span>
                                    </p>

                                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                        {pkg.bookings.map((b) => (
                                            <li key={b.id}>
                                                <span className="text-gray-600">
                                                    {format(parseISO(b.start_date), 'PPP')} → {format(parseISO(b.end_date), 'PPP')}
                                                </span>{' '}
                                                — LKR {b.price}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
