import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import BookingDetailModal from '@/components/booking-detail-modal';
import ExtendConfirmModal from '@/components/extend-confirm-modal';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [{ title: 'Bookings', href: '/admin/booking-management' }];

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

export default function BookingManagement({ bookings: initialBookings, extendRanges }: Props) {
    const { props } = usePage();
    const flash = props.flash as { success?: string };

    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [processing, setProcessing] = useState<number | null>(null);
    const [selectedDurations, setSelectedDurations] = useState<Record<number, string>>({});
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [extendModalOpen, setExtendModalOpen] = useState(false);
    const [pendingExtension, setPendingExtension] = useState<{ bookingId: number; duration: string; newEndDate: string } | null>(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<{ bookingId: number; status: 'accepted' | 'rejected' } | null>(null);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
    }, [flash.success]);

    const updateBookingStatus = async (id: number, status: 'accepted' | 'rejected') => {
        setProcessing(id);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

            const { data } = await axios.put(
                `/api/admin/bookings/${id}`,
                { status },
                {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!data.success) throw new Error(data.message || `Failed to ${status} booking.`);

            setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
            toast.success(`Booking ${status}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update booking');
        } finally {
            setProcessing(null);
        }
    };

    const extendBooking = async (bookingId: number, duration: string) => {
        setProcessing(bookingId);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

            const { data } = await axios.post(
                '/api/booking-extend',
                { booking_id: bookingId, duration },
                {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!data.success || !data.updatedBooking) throw new Error(data.message || 'Failed to extend booking');

            const updatedEnd = new Date(data.updatedBooking.end_date).toISOString().split('T')[0];

            setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, end_date: updatedEnd } : b)));
            setSelectedDurations((prev) => ({ ...prev, [bookingId]: '' }));
            toast.success('Booking extended successfully');
        } catch (err: any) {
            toast.error(err.message || 'Extension failed');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Booking Management" />

            <div className="mx-auto mt-8 max-w-7xl space-y-6">
                <h1 className="text-2xl font-bold text-white">Booking Management</h1>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking, index) => (
                        <div key={booking.id} className="min-w-xs rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex justify-between">
                                <div className="mb-1 text-xs text-gray-400">#{index + 1}</div>
                                <button
                                    onClick={() => {
                                        setSelectedBooking(booking);
                                        setDetailModalOpen(true);
                                    }}
                                    className="flex cursor-pointer items-center text-xs text-blue-600 hover:underline"
                                >
                                    <FontAwesomeIcon icon={faEye} className="mr-1 h-3 w-3" />
                                    View
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{booking.full_name}</h3>
                            <p className="text-sm text-gray-600">Package: {booking.package_name}</p>
                            <p className="text-sm text-gray-600">
                                Date: {booking.start_date} → {booking.end_date}
                            </p>
                            <p className="text-sm text-gray-600">Price: LKR {booking.price}</p>
                            <p
                                className={`text-sm font-semibold capitalize ${booking.status === 'accepted' ? 'text-green-600' : booking.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}
                            >
                                Status: {booking.status}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {booking.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setPendingStatus({ bookingId: booking.id, status: 'accepted' });
                                                setStatusModalOpen(true);
                                            }}
                                            className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPendingStatus({ bookingId: booking.id, status: 'rejected' });
                                                setStatusModalOpen(true);
                                            }}
                                            className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    booking.status === 'accepted' && (
                                        <>
                                            <select
                                                value={selectedDurations[booking.id] || 'weekly'}
                                                onChange={(e) => setSelectedDurations((prev) => ({ ...prev, [booking.id]: e.target.value }))}
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
                                                    const duration = selectedDurations[booking.id] || 'weekly';
                                                    const end = new Date(booking.end_date);
                                                    const days = { daily: 1, '2-day': 2, weekly: 7, monthly: 30, yearly: 365 }[duration];
                                                    end.setDate(end.getDate() + days);
                                                    setPendingExtension({
                                                        bookingId: booking.id,
                                                        duration,
                                                        newEndDate: end.toISOString().split('T')[0],
                                                    });
                                                    setExtendModalOpen(true);
                                                }}
                                                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                            >
                                                Extend
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <BookingDetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} booking={selectedBooking} />

            {pendingExtension && (
                <ExtendConfirmModal
                    open={extendModalOpen}
                    onClose={() => setExtendModalOpen(false)}
                    onConfirm={() => {
                        extendBooking(pendingExtension.bookingId, pendingExtension.duration as ExtendRange['value']);
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
                    endDate=""
                />
            )}
        </AppLayout>
    );
}
