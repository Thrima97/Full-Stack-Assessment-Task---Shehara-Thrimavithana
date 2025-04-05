import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Booking {
    id: number;
    full_name: string;
    company_name?: string;
    telephone: string;
    email: string;
    address: string;
    package_name: string;
    start_date: string;
    end_date: string;
    price: string;
    status: 'pending' | 'accepted' | 'rejected';
    contract_path?: string;
    users?: {
        id: number;
        name: string;
        email: string;
    }[];
}

interface Props {
    open: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export default function BookingDetailModal({ open, onClose, booking }: Props) {
    if (!booking) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl rounded-2xl border border-gray-200 shadow-lg" aria-describedby="booking-details-description">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-800">Booking Details #{booking.id}</DialogTitle>
                </DialogHeader>

                <p id="booking-details-description" className="sr-only">
                    Full details about this booking, including package info, booking contact, and user list.
                </p>

                <div className="space-y-6 text-sm">
                    {/* Main Booking Details */}
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Booking Information</h3>
                        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <p>
                                    <span className="font-medium text-gray-600">Package:</span> {booking.package_name}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Full Name:</span> {booking.full_name}
                                </p>
                                {booking.company_name && (
                                    <p>
                                        <span className="font-medium text-gray-600">Company:</span> {booking.company_name}
                                    </p>
                                )}
                                <p>
                                    <span className="font-medium text-gray-600">Phone:</span> {booking.telephone}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Email:</span> {booking.email}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Address:</span> {booking.address}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Start Date:</span> {booking.start_date}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">End Date:</span> {booking.end_date}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Price:</span> LKR {booking.price}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-600">Status:</span>{' '}
                                    <span
                                        className={`capitalize ${
                                            booking.status === 'accepted'
                                                ? 'text-green-600'
                                                : booking.status === 'rejected'
                                                  ? 'text-red-600'
                                                  : 'text-yellow-600'
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                </p>
                            </div>

                            {/* View Contract Button */}
                            {booking.contract_path && (
                                <div className="mt-4">
                                    <a
                                        href={`/download-contract/${booking.contract_path.split('/').pop()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        View Contract
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Users */}
                    {booking.users && booking.users.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-base font-semibold text-gray-700">Associated Users</h3>
                            <div className="space-y-3">
                                {booking.users.map((user) => (
                                    <div key={user.id} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                                        <p>
                                            <span className="font-medium text-gray-600">User ID:</span> {user.id}
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">Name:</span> {user.name}
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">Email:</span> {user.email}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
