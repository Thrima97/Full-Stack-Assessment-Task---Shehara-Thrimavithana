import BookingDetailModal from '@/components/booking-detail-modal';
import ExtendConfirmModal from '@/components/extend-confirm-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bookings',
        href: '/admin/booking-management',
    },
];

interface Booking {
    id: number;
    full_name: string;
    package_name: string;
    start_date: string;
    end_date: string;
    price: string;
    status: 'pending' | 'accepted' | 'rejected';
}

interface ExtendRange {
    value: 'daily' | '2-day' | 'weekly' | 'monthly' | 'yearly';
    label: string;
}

interface Props {
    bookings: Booking[];
    extendRanges: ExtendRange[];
}

export default function Booking({ bookings: initialBookings, extendRanges }: Props) {
    const { props } = usePage();
    const flash = props.flash as { success?: string };
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [processing, setProcessing] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedDurations, setSelectedDurations] = useState<Record<number, string>>({});
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const [extendModalOpen, setExtendModalOpen] = useState(false);
    const [pendingExtension, setPendingExtension] = useState<{
        bookingId: number;
        duration: ExtendRange['value'];
        newEndDate: string;
    } | null>(null);

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<{
        bookingId: number;
        status: 'accepted' | 'rejected';
    } | null>(null);

    const updateBookingStatus = async (id: number, status: 'accepted' | 'rejected') => {
        setProcessing(id);
        setSuccessMessage(null);
        setErrorMessage(null);

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        try {
            const response = await axios.put(
                `/api/admin/bookings/${id}`,
                { status },
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );

            const result = response.data;

            if (!result.success) {
                setErrorMessage(result?.message || `Failed to ${status} booking.`);
                return;
            }

            setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
            setSuccessMessage(`Booking has been ${status}.`);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred.';
            setErrorMessage(`Something went wrong: ${errorMessage}`);
        } finally {
            setProcessing(null);
        }
    };

    const extendBooking = async (booking_id: number, duration: ExtendRange['value']) => {
        setProcessing(booking_id);
        setSuccessMessage(null);
        setErrorMessage(null);

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        try {
            const response = await axios.post(
                '/api/booking-extend',
                { booking_id, duration },
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );

            const result = response.data;

            if (!result.success || !result.updatedBooking) {
                setErrorMessage(result?.message || 'Failed to extend booking.');
                return;
            }

            const updatedEndDate = new Date(result.updatedBooking.end_date).toISOString().split('T')[0];

            setBookings((prev) => prev.map((booking) => (booking.id === booking_id ? { ...booking, end_date: updatedEndDate } : booking)));

            setSelectedDurations((prev) => ({ ...prev, [booking_id]: '' }));
            setSuccessMessage('Booking extended successfully.');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred.';
            setErrorMessage(errorMessage);
        } finally {
            setProcessing(null);
        }
    };

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Booking Management" />

            <div className="mx-auto mt-8 max-w-5xl space-y-6">
                <h1 className="text-2xl font-bold">Booking Management</h1>

                {flash?.success && <div className="rounded border border-green-300 bg-green-100 p-3 text-sm text-green-800">{flash.success}</div>}
                {successMessage && <div className="rounded border border-green-300 bg-green-100 p-3 text-sm text-green-800">{successMessage}</div>}
                {errorMessage && <div className="rounded border border-red-300 bg-red-100 p-3 text-sm text-red-800">{errorMessage}</div>}

                <div className="overflow-x-auto rounded border">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2">#</th>
                                <th className="px-4 py-2">Full Name</th>
                                <th className="px-4 py-2">Package</th>
                                <th className="px-4 py-2">Date Range</th>
                                <th className="px-4 py-2">Price (LKR)</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                                <th className="px-4 py-2">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={booking.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">{booking.full_name}</td>
                                    <td className="px-4 py-2">{booking.package_name}</td>
                                    <td className="px-4 py-2">
                                        {booking.start_date} → {booking.end_date}
                                    </td>
                                    <td className="px-4 py-2">{booking.price}</td>
                                    <td className="px-4 py-2 capitalize">{booking.status}</td>
                                    <td className="space-y-1 px-4 py-2">
                                        {booking.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setPendingStatus({ bookingId: booking.id, status: 'accepted' });
                                                        setStatusModalOpen(true);
                                                    }}
                                                    disabled={processing === booking.id}
                                                    className="mr-2 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {processing === booking.id ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPendingStatus({ bookingId: booking.id, status: 'rejected' });
                                                        setStatusModalOpen(true);
                                                    }}
                                                    disabled={processing === booking.id}
                                                    className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {processing === booking.id ? 'Rejecting...' : 'Reject'}
                                                </button>
                                            </>
                                        ) : (
                                            <span
                                                className={`text-xs font-medium ${booking.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {booking.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                                            </span>
                                        )}

                                        {booking.status === 'accepted' && (
                                            <div className="mt-2 flex items-center space-x-2">
                                                <select
                                                    value={selectedDurations[booking.id] || 'weekly'}
                                                    onChange={(e) =>
                                                        setSelectedDurations((prev) => ({
                                                            ...prev,
                                                            [booking.id]: e.target.value,
                                                        }))
                                                    }
                                                    className="rounded border px-2 py-1 text-xs"
                                                >
                                                    {extendRanges.map((range) => (
                                                        <option key={range.value} value={range.value}>
                                                            {range.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    onClick={() => {
                                                        const duration = (selectedDurations[booking.id] as ExtendRange['value']) || 'weekly';

                                                        const currentEnd = new Date(booking.end_date);
                                                        const durationDays = {
                                                            daily: 1,
                                                            '2-day': 2,
                                                            weekly: 7,
                                                            monthly: 30,
                                                            yearly: 365,
                                                        }[duration];

                                                        const newEnd = new Date(currentEnd);
                                                        newEnd.setDate(newEnd.getDate() + durationDays);
                                                        const newEndDate = newEnd.toISOString().split('T')[0];

                                                        setPendingExtension({ bookingId: booking.id, duration, newEndDate });
                                                        setExtendModalOpen(true);
                                                    }}
                                                    disabled={processing === booking.id}
                                                    className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    Extend
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setDetailModalOpen(true);
                                            }}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BookingDetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} booking={selectedBooking} />

            {pendingExtension && (
                <ExtendConfirmModal
                    open={extendModalOpen}
                    onClose={() => setExtendModalOpen(false)}
                    onConfirm={() => {
                        extendBooking(pendingExtension.bookingId, pendingExtension.duration);
                        setExtendModalOpen(false);
                        setPendingExtension(null);
                    }}
                    duration={pendingExtension.duration}
                    endDate={pendingExtension.newEndDate}
                />
            )}

            {pendingStatus && (
                <ExtendConfirmModal
                    open={statusModalOpen}
                    onClose={() => setStatusModalOpen(false)}
                    onConfirm={() => {
                        updateBookingStatus(pendingStatus.bookingId, pendingStatus.status);
                        setStatusModalOpen(false);
                        setPendingStatus(null);
                    }}
                    duration={pendingStatus.status}
                    endDate={''}
                />
            )}
        </AppLayout>
    );
}
