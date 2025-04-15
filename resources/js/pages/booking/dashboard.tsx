import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Booking',
        href: '/user/booking/list',
    },
];

interface Booking {
    id: number;
    package: {
        name: string;
        seat: number;
        description: string;
    };
    full_name: string;
    company_name: string | null;
    telephone: string;
    email: string;
    address: string;
    start_date: Date;
    end_date: Date;
    status: 'pending' | 'accepted' | 'rejected';
    price: string | null;
    contract_path?: string | null;
}

export default function UserBooking() {
    const page = usePage();
    const flash = page.props.flash as { success?: string; error?: string };
    const user = page.props.auth.user as { id: number };

    const [bookings, setBookings] = useState<Booking[] | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`/api/bookings?user_id=${user.id}`);
                setBookings(response.data.bookings.slice(0, 2)); // 👈 Only show 2 bookings
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setBookings([]);
            }
        };

        fetchBookings();
    }, [user.id]);

    const getStatusClasses = (status: Booking['status']) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Your Bookings" />

            <div className="mx-auto mt-8 max-w-7xl space-y-6 px-4 pb-8 sm:px-6 lg:px-0">
                <h1 className="text-2xl font-bold text-white">Your Bookings</h1>

                {flash?.success && (
                    <div className="rounded-md border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-800">{flash.success}</div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {bookings === null ? (
                        <p>Loading...</p>
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <div key={booking.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow transition hover:shadow-md">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-800">{booking.package.name}</h2>
                                    <span
                                        className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                            booking.status,
                                        )}`}
                                    >
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                    <p>
                                        <strong>Start:</strong> {new Date(booking.start_date).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>End:</strong> {new Date(booking.end_date).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>Price:</strong> LKR {booking.price ?? 'N/A'}
                                    </p>
                                    <hr className="my-2" />
                                    <p>
                                        <strong>Full Name:</strong> {booking.full_name}
                                    </p>
                                    <p>
                                        <strong>Company:</strong> {booking.company_name || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Telephone:</strong> {booking.telephone}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {booking.email}
                                    </p>
                                    <p>
                                        <strong>Address:</strong> {booking.address || 'N/A'}
                                    </p>
                                    {booking.contract_path && (
                                        <p className="pt-2">
                                            <a
                                                href={`/download-contract/${booking.contract_path}`.replace('contracts/', '')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                            >
                                                View Contract
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-white">No bookings yet.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
