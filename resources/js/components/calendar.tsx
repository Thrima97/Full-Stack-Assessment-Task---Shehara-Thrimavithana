import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isToday, parseISO, startOfMonth, subMonths } from 'date-fns';
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

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch(route('packages.index'));
                const data = await response.json();
                if (data.success) {
                    const formattedPackages: Package[] = data.data.map((pkg: any) => {
                        const bookedRanges = pkg.booked || [];

                        const expandedDates: string[] = bookedRanges.flatMap((range: any) => {
                            const dates = eachDayOfInterval({
                                start: parseISO(range.start_date),
                                end: parseISO(range.end_date),
                            });
                            return dates.map((date) => format(date, 'yyyy-MM-dd'));
                        });

                        return {
                            id: pkg.id,
                            name: pkg.name,
                            seat: parseInt(pkg.seat),
                            description: pkg.description,
                            bookedRanges,
                            booked: expandedDates,
                        };
                    });

                    setPackages(formattedPackages);
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };

        fetchPackages();
    }, []);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const goToPreviousMonth = () => {
        const now = new Date();
        const current = new Date(currentMonth.getFullYear(), currentMonth.getMonth());
        const minimum = new Date(now.getFullYear(), now.getMonth());

        if (current > minimum) {
            setCurrentMonth(subMonths(currentMonth, 1));
        }
    };

    const availablePackages = useMemo(() => {
        if (!selectedDate) return [];
        const selectedStr = format(selectedDate, 'yyyy-MM-dd');
        return packages.filter((pkg) => {
            const isBooked = pkg.booked.includes(selectedStr);
            const seatMatches = seatFilter === null || pkg.seat === seatFilter;
            return !isBooked && seatMatches;
        });
    }, [selectedDate, packages, seatFilter]);

    return (
        <div className="p-4">
            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <div>
                    <label htmlFor="month-select" className="mr-2 text-sm text-gray-500">
                        Month:
                    </label>
                    <select
                        id="month-select"
                        className="rounded border px-2 py-1"
                        value={format(currentMonth, 'yyyy-MM')}
                        onChange={(e) => {
                            const [year, month] = e.target.value.split('-').map(Number);
                            setCurrentMonth(new Date(year, month - 1));
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, index) => {
                            const date = new Date(currentMonth.getFullYear(), index);
                            const now = new Date();
                            const isSameMonth = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();

                            if (date > now || isSameMonth) {
                                return (
                                    <option key={index} value={format(date, 'yyyy-MM')}>
                                        {format(date, 'MMMM')}
                                    </option>
                                );
                            }
                            return null;
                        })}
                    </select>
                </div>

                <div>
                    <label htmlFor="year-select" className="mr-2 text-sm text-gray-500">
                        Year:
                    </label>
                    <select
                        id="year-select"
                        className="rounded border px-2 py-1"
                        value={currentMonth.getFullYear()}
                        onChange={(e) => {
                            const year = Number(e.target.value);
                            setCurrentMonth(new Date(year, currentMonth.getMonth()));
                        }}
                    >
                        {Array.from({ length: 10 }).map((_, index) => {
                            const year = new Date().getFullYear() + index;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label htmlFor="seat-filter" className="mr-2 text-sm text-gray-600">
                        Seat Count:
                    </label>
                    <select
                        id="seat-filter"
                        className="rounded border px-2 py-1"
                        value={seatFilter ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSeatFilter(val === '' ? null : parseInt(val));
                        }}
                    >
                        <option value="">All</option>
                        {seatCounts.map((seat) => (
                            <option key={seat.value} value={seat.value}>
                                {seat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Navigation */}
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={goToPreviousMonth}
                    className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
                    disabled={currentMonth.getFullYear() === new Date().getFullYear() && currentMonth.getMonth() === new Date().getMonth()}
                >
                    Previous
                </button>
                <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={goToNextMonth} className="rounded bg-gray-200 px-4 py-2">
                    Next
                </button>
            </div>

            {/* Calendar Days */}
            <div className="calendar overflow-x-auto">
                <div className="grid min-w-[700px] grid-cols-7 gap-2">
                    {daysInMonth.map((date) => {
                        const formattedDate = format(date, 'yyyy-MM-dd');
                        const now = new Date();
                        const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const availableOnThisDate = packages.filter((pkg) => {
                            const isBooked = pkg.booked.includes(formattedDate);
                            const seatMatches = seatFilter === null || pkg.seat === seatFilter;
                            return !isBooked && seatMatches;
                        });
                        const isDisabled = isPast || availableOnThisDate.length === 0;

                        return (
                            <div
                                key={date.toISOString()}
                                className={`rounded border p-2 text-center transition-all duration-150 ${isDisabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'cursor-pointer hover:bg-blue-100'} ${isSameDay(date, selectedDate) && !isDisabled ? 'bg-blue-200' : ''} ${isToday(date) && !isDisabled ? 'border-blue-500' : ''} `}
                                onClick={() => {
                                    if (!isDisabled) handleDateClick(date);
                                }}
                            >
                                <p className="font-semibold">{format(date, 'd')}</p>
                                {!isDisabled && <p className="text-xs text-green-600">Available: {availableOnThisDate.length}</p>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Date Availability */}
            {selectedDate && (
                <div className="mt-6 rounded border bg-gray-50 p-4">
                    <h3 className="mb-2 text-lg font-semibold">Available Offices on {format(selectedDate, 'PPP')}:</h3>

                    {availablePackages.length > 0 ? (
                        <ul className="ml-6 list-disc text-sm">
                            {availablePackages.map((pkg) => (
                                <li key={`${pkg.id}-${pkg.name}`}>
                                    <span className="font-medium">{pkg.name}</span> — {pkg.description}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-red-600">No office available for this date.</p>
                    )}
                </div>
            )}
        </div>
    );
}
