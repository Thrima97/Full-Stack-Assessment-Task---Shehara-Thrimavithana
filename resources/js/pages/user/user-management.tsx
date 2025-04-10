import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/user-management',
    },
];

interface Option {
    id: number;
    label: string;
}

interface ValidationErrors {
    [key: string]: string[];
}

export default function Dashboard() {
    const { props } = usePage();
    const bookingOptions = props.bookingOptions as Option[];
    const userOptions = props.userOptions as Option[];

    const [nic, setNic] = useState('');
    const [company, setCompany] = useState('');
    const [bookingId, setBookingId] = useState<number | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [contractFile, setContractFile] = useState<File | null>(null);

    const [errors, setErrors] = useState<ValidationErrors>({});

    const submitNicDetails = async () => {
        setErrors({});

        try {
            await axios.post('/api/admin/nic-details', {
                booking_id: bookingId,
                user_id: userId,
                nic_number: nic,
                company,
            });
            toast.success('NIC details added successfully');
            setNic('');
            setCompany('');
            setBookingId(null);
            setUserId(null);
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Failed to submit NIC details');
            }
        }
    };

    const submitContract = async () => {
        setErrors({});

        if (!contractFile || !bookingId) {
            setErrors({ contract_file: ['Please choose a file and booking.'] });
            return;
        }

        const formData = new FormData();
        formData.append('booking_id', String(bookingId));
        formData.append('contract_file', contractFile);

        try {
            await axios.post('/api/admin/contracts', formData);
            toast.success('Contract uploaded successfully');
            setContractFile(null);
            setBookingId(null);
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Failed to upload contract');
            }
        }
    };

    const renderError = (field: string) => errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field][0]}</p>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="mx-auto max-w-2xl space-y-8 py-6">
                <h1 className="text-xl font-semibold text-gray-800">User Management</h1>

                {/* NIC Section */}
                <div className="rounded-lg border p-4 shadow-sm">
                    <h2 className="mb-3 text-lg font-medium">Add NIC Details to Booking</h2>

                    <select
                        className="mb-2 w-full rounded border px-3 py-2"
                        value={bookingId ?? ''}
                        onChange={(e) => setBookingId(Number(e.target.value))}
                    >
                        <option value="">Select Booking</option>
                        {bookingOptions?.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {renderError('booking_id')}

                    <select className="mb-2 w-full rounded border px-3 py-2" value={userId ?? ''} onChange={(e) => setUserId(Number(e.target.value))}>
                        <option value="">Select User</option>
                        {userOptions?.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {renderError('user_id')}

                    <input
                        type="text"
                        className="mb-2 w-full rounded border px-3 py-2"
                        placeholder="NIC Number"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                    />
                    {renderError('nic_number')}

                    <input
                        type="text"
                        className="mb-4 w-full rounded border px-3 py-2"
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                    {renderError('company')}

                    <button onClick={submitNicDetails} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Submit NIC Details
                    </button>
                </div>

                {/* Contract Section */}
                <div className="rounded-lg border p-4 shadow-sm">
                    <h2 className="mb-3 text-lg font-medium">Upload Signed Contract</h2>

                    <select
                        className="mb-2 w-full rounded border px-3 py-2"
                        value={bookingId ?? ''}
                        onChange={(e) => setBookingId(Number(e.target.value))}
                    >
                        <option value="">Select Booking</option>
                        {bookingOptions?.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {renderError('booking_id')}

                    <input
                        type="file"
                        className="block w-full cursor-pointer rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                    />
                    {renderError('contract_file') || renderError('contract')}

                    <button onClick={submitContract} className="mt-3 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        Upload Contract
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
