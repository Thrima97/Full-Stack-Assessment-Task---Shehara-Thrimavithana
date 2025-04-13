import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { eachDayOfInterval, format, isAfter, isToday, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Booking', href: '/user/booking' }];

interface RawBookingRange {
    start_date: string;
    end_date: string;
}

interface Package {
    id: number;
    name: string;
    seat: number;
    description: string;
    bookedRanges: RawBookingRange[];
    booked: string[];
}

export default function CreateBooking() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [price, setPrice] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('/api/packages', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Failed to fetch packages');
                const data = await res.json();

                if (data.success) {
                    const mapped: Package[] = data.data.map((pkg: any) => {
                        const bookedRanges: RawBookingRange[] = pkg.booked || [];
                        const booked = bookedRanges.flatMap((range) => {
                            const dates = eachDayOfInterval({
                                start: parseISO(range.start_date),
                                end: parseISO(range.end_date),
                            });
                            return dates.map((date) => format(date, 'yyyy-MM-dd'));
                        });
                        return { ...pkg, bookedRanges, booked };
                    });
                    setPackages(mapped);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };
        fetchPackages();
    }, []);

    const isFutureOrToday = (dateStr: string) => {
        const date = parseISO(dateStr);
        return isToday(date) || isAfter(date, new Date());
    };

    const validateAvailability = () => {
        setError(null);
        setIsAvailable(null);
        setValidationErrors({});

        if (!selectedPackageId || !startDate || !endDate) {
            setError('Please select all fields.');
            return;
        }

        if (!isFutureOrToday(startDate) || !isFutureOrToday(endDate)) {
            setError('Start and end dates must be today or in the future.');
            return;
        }

        if (isAfter(parseISO(startDate), parseISO(endDate))) {
            setError('Start date must be before or equal to end date.');
            return;
        }

        const selectedPkg = packages.find((pkg) => pkg.id === selectedPackageId);
        if (!selectedPkg) {
            setError('Invalid package selected');
            return;
        }

        const datesToCheck = eachDayOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate),
        }).map((date) => format(date, 'yyyy-MM-dd'));

        const isClashing = datesToCheck.some((date) => selectedPkg.booked.includes(date));

        if (isClashing) {
            setIsAvailable(false);
            setError('Selected package is already booked during this period.');
        } else {
            setIsAvailable(true);
        }
    };

    const validatePrice = (value: string) => /^\d+(\.\d{1,2})?$/.test(value) && parseFloat(value) > 0;

    const submitBooking = async () => {
        setError(null);
        setValidationErrors({});

        if (!selectedPackageId || !startDate || !endDate || !price) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (!validatePrice(price)) {
            toast.error('Invalid price. Must be a positive number with up to 2 decimal places.');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(
                '/api/bookings',
                {
                    package_id: selectedPackageId,
                    start_date: startDate,
                    end_date: endDate,
                    price: parseFloat(price),
                    full_name: fullName,
                    company_name: companyName,
                    telephone,
                    email,
                    address,
                },
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        Accept: 'application/json',
                    },
                },
            );

            toast.success('Booking request submitted successfully!');
            console.log(response.data);
        } catch (error: any) {
            if (error.response) {
                const errors = error.response.data.errors || {};
                const message = error.response.data.message;
                if (errors.message && Array.isArray(errors.message) && errors.message.length > 0) {
                    toast.error(errors.message[0]);
                } else if (typeof message === 'string') {
                    toast.error(message);
                }

                setValidationErrors(errors);
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Booking Form" />

            <div className="mx-auto mt-8 max-w-xl space-y-6 px-4">
                {isAvailable === true ? (
                    <h1 className="text-2xl font-bold text-white">Book a Workspace</h1>
                ) : (
                    <h1 className="text-xl font-bold text-white">Check Availability on Workspace</h1>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="package" className="mb-1 block text-sm font-medium text-white">
                            Select Package
                        </label>
                        <select
                            id="package"
                            className="w-full rounded border px-3 py-2 text-white"
                            value={selectedPackageId ?? ''}
                            onChange={(e) => {
                                setSelectedPackageId(Number(e.target.value));
                                setIsAvailable(null);
                                setPrice('');
                            }}
                        >
                            <option value="" className="text-black">
                                -- Select Package --
                            </option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id} className="text-black">
                                    {pkg.name} ({pkg.seat} seats)
                                </option>
                            ))}
                        </select>
                        {validationErrors.package_id && <p className="text-sm text-red-600">{validationErrors.package_id}</p>}
                    </div>

                    {/* Start and End Dates */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-white">
                                Start Date
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                min={format(new Date(), 'yyyy-MM-dd')}
                                className="w-full rounded border px-3 py-2 text-white"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setIsAvailable(null);
                                    setPrice('');
                                }}
                            />
                            {validationErrors.start_date && <p className="text-sm text-red-600">{validationErrors.start_date}</p>}
                        </div>

                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-white">
                                End Date
                            </label>
                            <input
                                id="end-date"
                                type="date"
                                min={startDate || format(new Date(), 'yyyy-MM-dd')}
                                className="w-full rounded border px-3 py-2 text-white"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setIsAvailable(null);
                                    setPrice('');
                                }}
                            />
                            {validationErrors.end_date && <p className="text-sm text-red-600">{validationErrors.end_date}</p>}
                        </div>
                    </div>

                    {isAvailable === true && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-white">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full rounded border px-3 py-2 text-white"
                                />
                                {validationErrors.full_name && <p className="text-sm text-red-600">{validationErrors.full_name}</p>}
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-white">Company Name</label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full rounded border px-3 py-2 text-white"
                                />
                                {validationErrors.company_name && <p className="text-sm text-red-600">{validationErrors.company_name}</p>}
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-white">Telephone</label>
                                <input
                                    type="text"
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    className="w-full rounded border px-3 py-2 text-white"
                                />
                                {validationErrors.telephone && <p className="text-sm text-red-600">{validationErrors.telephone}</p>}
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-white">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded border px-3 py-2 text-white"
                                />
                                {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-white">Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded border px-3 py-2 text-white"
                                />
                                {validationErrors.address && <p className="text-sm text-red-600">{validationErrors.address}</p>}
                            </div>
                            <div className="col-span-3">
                                <label htmlFor="price" className="mb-1 block text-sm font-medium text-white">
                                    Enter Price (LKR)
                                </label>
                                <input
                                    id="price"
                                    type="text"
                                    className="w-full rounded border px-3 py-2 text-white"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 123.45"
                                />
                                {validationErrors.price && <p className="text-sm text-red-600">{validationErrors.price}</p>}
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        {isAvailable === true ? (
                            <button
                                disabled={submitting}
                                onClick={submitBooking}
                                className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                {submitting ? 'Booking...' : 'Book Now'}
                            </button>
                        ) : (
                            <button onClick={validateAvailability} className="mb-4 w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                Check Availability
                            </button>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {isAvailable === true && <p className="mb-4 text-sm text-green-600">Package is available ✅</p>}
                    {isAvailable === false && <p className="mb-4 text-sm text-red-600">Package is NOT available ❌</p>}
                </div>
            </div>
        </AppLayout>
    );
}
