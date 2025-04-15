import companyImage from '@/assets/company.jpg';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isToday,
    parseISO,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

interface Package {
    id: number;
    name: string;
    seat: number;
    description: string;
    bookedRanges: { start_date: string; end_date: string }[];
    booked: string[];
}

interface SeatOption {
    label: string;
    value: number;
}

interface CalendarProps {
    seatCounts: SeatOption[];
}

export default function Calendar({ seatCounts }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [packages, setPackages] = useState<Package[]>([]);
    const [seatFilter, setSeatFilter] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(route('packages.index'));
                const data = await response.json();

                if (data.success) {
                    const formatted = data.data.map((pkg: any) => {
                        const booked = pkg.booked || [];

                        const expandedDates = booked.flatMap((range: any) =>
                            eachDayOfInterval({
                                start: parseISO(range.start_date),
                                end: parseISO(range.end_date),
                            }).map((d) => format(d, 'yyyy-MM-dd')),
                        );

                        return {
                            id: pkg.id,
                            name: pkg.name,
                            seat: parseInt(pkg.seat),
                            description: pkg.description,
                            bookedRanges: booked,
                            booked: expandedDates,
                        };
                    });

                    setPackages(formatted);
                }
            } catch (error) {
                console.error('Failed to fetch packages', error);
            }
        };

        fetchPackages();
    }, []);

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const availablePackages = useMemo(() => {
        if (!selectedDate) return [];

        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        return packages.filter((pkg) => {
            const isBooked = pkg.booked.includes(dateStr);
            const seatMatch = seatFilter === null || pkg.seat === seatFilter;
            return !isBooked && seatMatch;
        });
    }, [selectedDate, packages, seatFilter]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [year, month] = e.target.value.split('-').map(Number);
        setCurrentMonth(new Date(year, month - 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = Number(e.target.value);
        setCurrentMonth(new Date(year, currentMonth.getMonth()));
    };

    const handleSeatFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSeatFilter(val === '' ? null : parseInt(val));
    };

    const goToPreviousMonth = () => {
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth());
        const targetMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth());

        if (targetMonth > thisMonth) {
            setCurrentMonth(subMonths(currentMonth, 1));
        }
    };

    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDateClick = (date: Date, disabled: boolean) => {
        if (!disabled) setSelectedDate(date);
    };

    return (
        <section className="relative py-8 sm:p-8">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 xl:px-14">
                {/* Filters (Mobile Toggle) */}
                <div className="mb-4 flex justify-end sm:hidden">
                    <button
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                {/* Filters */}
                <div className={`mb-6 grid w-full gap-4 ${showFilters ? '' : 'hidden'} sm:flex sm:flex-wrap sm:items-center`}>
                    {/* Month Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label htmlFor="month-select" className="mb-1 text-sm text-white sm:mr-2 sm:mb-0">
                            Month:
                        </label>
                        <select
                            id="month-select"
                            className="w-full rounded border px-2 py-1 text-sm text-white sm:w-auto"
                            value={format(currentMonth, 'yyyy-MM')}
                            onChange={handleMonthChange}
                        >
                            {Array.from({ length: 12 }).map((_, i) => {
                                const d = new Date(currentMonth.getFullYear(), i);
                                return (
                                    <option key={i} value={format(d, 'yyyy-MM')} className="text-black">
                                        {format(d, 'MMMM')}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label htmlFor="year-select" className="mb-1 text-sm text-white sm:mr-2 sm:mb-0">
                            Year:
                        </label>
                        <select
                            id="year-select"
                            className="w-full rounded border px-2 py-1 text-sm text-white sm:w-auto"
                            value={currentMonth.getFullYear()}
                            onChange={handleYearChange}
                        >
                            {Array.from({ length: 5 }).map((_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                    <option key={year} value={year} className="text-black">
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Seat Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label htmlFor="seat-filter" className="mb-1 text-sm text-white sm:mr-2 sm:mb-0">
                            Seat Count:
                        </label>
                        <select
                            id="seat-filter"
                            className="w-full rounded border px-2 py-1 text-sm text-white sm:w-auto"
                            value={seatFilter ?? ''}
                            onChange={handleSeatFilterChange}
                        >
                            <option value="" className="text-black">
                                All
                            </option>
                            {seatCounts.map((seat) => (
                                <option key={seat.value} value={seat.value} className="text-black">
                                    {seat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Calendar Header */}
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <h5 className="text-xl font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h5>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentMonth(new Date())}
                                className="hidden items-center gap-1.5 rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 md:flex"
                            >
                                Today
                            </button>
                            <button onClick={goToPreviousMonth} className="rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                                ◀
                            </button>
                            <button onClick={goToNextMonth} className="rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                                ▶
                            </button>
                        </div>
                    </div>
                </div>

                {/* Weekday Labels */}
                <div className="border border-black">
                    <div className="grid grid-cols-7 divide-x divide-black border-b border-black bg-gray-100">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="p-3.5 text-center text-sm font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 divide-x divide-black">
                        {calendarDays.map((date) => {
                            const formatted = format(date, 'yyyy-MM-dd');
                            const today = new Date();
                            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const available = packages.filter(
                                (pkg) => !pkg.booked.includes(formatted) && (seatFilter === null || pkg.seat === seatFilter),
                            );
                            const isDisabled = isPast || available.length === 0;
                            const isSelected = isSameDay(date, selectedDate);
                            const isOtherMonth = date.getMonth() !== currentMonth.getMonth(); // ✅ PLACE IT HERE
                            return (
                                <div
                                    key={date.toISOString()}
                                    onClick={() => handleDateClick(date, isDisabled)}
                                    className={`flex min-h-[70px] flex-col items-center justify-between p-1.5 transition sm:p-3.5 ${isOtherMonth ? 'bg-gay-400 text-gay-100' : 'bg-white'} ${isDisabled ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'cursor-pointer hover:bg-gray-300'} ${isToday(date) ? 'border border-indigo-500' : 'border border-gray-300'} ${isSelected ? 'bg-indigo-100' : ''}`}
                                >
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold sm:h-7 sm:w-7 sm:text-xs">
                                        {format(date, 'd')}
                                    </span>
                                    {!isDisabled && (
                                        <>
                                            {available.length > 0 && (
                                                <span className="block text-[10px] leading-tight font-semibold text-blue-600 sm:hidden">
                                                    {Array.from({ length: available.length }).map((_, i) => (
                                                        <span key={i} className="mr-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                    ))}
                                                </span>
                                            )}

                                            <span className="mt-1 hidden rounded bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 sm:block">
                                                {available.length} Available
                                            </span>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>{packages.length === 0 && <p className="text-lg text-gray-300 mt-2 px-1">No packages data</p>}</div>

                {/* Selected Date - Packages */}
                {selectedDate && (
                    <>
                        {/* Desktop */}
                        <div className="mt-6 hidden border bg-gray-50 p-4 lg:block">
                            <h3 className="mb-4 text-lg font-semibold">Available Offices on {format(selectedDate, 'PPP')}:</h3>
                            {availablePackages.length > 0 ? (
                                <ul className="grid gap-4 md:grid-cols-2">
                                    {availablePackages.map((pkg) => (
                                        <li key={pkg.id}>
                                            <a className="flex flex-col items-center rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-100 md:flex-row">
                                                <img
                                                    src={companyImage}
                                                    alt="Office"
                                                    className="h-40 max-h-[100px] w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                                                />
                                                <div className="flex flex-col justify-between p-4 leading-normal">
                                                    <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{pkg.name}</h5>
                                                    <p className="mb-1 text-sm text-gray-700">{pkg.description}</p>
                                                    <p className="text-sm text-gray-500">Seats: {pkg.seat}</p>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-red-600">No office available for this date.</p>
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="w-full px-2.5 py-8 lg:hidden">
                            <div className="w-full rounded-xl bg-gray-50">
                                <h4 className="p-3 text-sm font-medium text-gray-900">Available on {format(selectedDate, 'PPP')}</h4>
                                {availablePackages.length > 0 ? (
                                    <ul className="space-y-3 px-3 pb-3">
                                        {availablePackages.map((pkg) => (
                                            <li key={pkg.id}>
                                                <a className="flex flex-col items-center rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-100">
                                                    <img
                                                        src={companyImage}
                                                        alt="Office"
                                                        className="h-40 max-h-[150px] w-full rounded-t-lg object-cover"
                                                    />
                                                    <div className="w-full p-4 text-left">
                                                        <h5 className="mb-1 text-base font-bold tracking-tight text-gray-900">{pkg.name}</h5>
                                                        <p className="mb-1 text-sm text-gray-700">{pkg.description}</p>
                                                        <p className="text-xs text-gray-500">Seats: {pkg.seat}</p>
                                                    </div>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="px-3 pb-3 text-sm text-red-600">No availability</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
