<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function addNicDetails(array $data): void
    {
        $booking = Booking::findOrFail($data['booking_id']);

        $booking->attachNicDetails(
            $data['user_id'],
            $data['nic_number'],
            $data['company']
        );
    }

    public function uploadContract(int $bookingId, UploadedFile $file): Booking
    {
        $path = $file->store('contracts');

        $booking = Booking::findOrFail($bookingId);
        $booking->contract_path = $path;
        $booking->save();

        return $booking;
    }

    public function getBookingManagementData(): Collection
    {
        return Booking::with(['package', 'users'])->get()->map(function ($booking) {
            return [
                'id' => $booking->id,
                'full_name' => $booking->full_name,
                'company_name' => $booking->company_name,
                'telephone' => $booking->telephone,
                'email' => $booking->email,
                'address' => $booking->address,
                'package_name' => $booking->package->name,
                'start_date' => $booking->start_date->toDateString(),
                'end_date' => $booking->end_date->toDateString(),
                'price' => $booking->price,
                'status' => $booking->status,
                'contract_path' => $booking->contract_path,
                'users' => $booking->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]),
            ];
        });
    }

    public function createBooking(array $validated): Booking
    {
        $userId = Auth::id();

        $bookingCount = Booking::whereHas('users', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->count();

        if ($bookingCount >= 2) {
            throw ValidationException::withMessages([
                'message' => 'You have already reached the maximum of 2 bookings.',
            ]);
        }

        return DB::transaction(function () use ($validated, $userId) {
            $booking = Booking::create([
                'package_id'    => $validated['package_id'],
                'full_name'     => $validated['full_name'],
                'company_name'  => $validated['company_name'],
                'telephone'     => $validated['telephone'],
                'email'         => $validated['email'],
                'address'       => $validated['address'],
                'start_date'    => $validated['start_date'],
                'end_date'      => $validated['end_date'],
                'price'         => $validated['price'],
                'status' => BookingStatus::Pending->value,
            ]);

            $booking->attachUser($userId);

            return $booking;
        });
    }

    public function getBookingsForUser(int $userId)
    {
        return Booking::with('package')
            ->whereHas('users', fn($q) => $q->where('user_id', $userId))
            ->orderByDesc('created_at')
            ->get();
    }

    public function updateStatus(int $bookingId, string $status): array
    {
        $booking = Booking::findOrFail($bookingId);

        if ($status === BookingStatus::Accepted->value && $booking->hasDateConflict()) {
            return [
                'success' => false,
                'message' => 'Booking cannot be approved because the selected date range is already reserved.',
                'status_code' => 409,
            ];
        }

        $booking->status = $status;
        $booking->save();

        return [
            'success' => true,
            'message' => "Booking #{$bookingId} updated to '{$status}'",
            'updatedBooking' => $booking,
            'status_code' => 200,
        ];
    }

    public function extendBooking(int $bookingId, string $duration): array
    {
        $booking = Booking::findOrFail($bookingId);

        $extensionDays = match ($duration) {
            'daily' => 1,
            '2-day' => 2,
            'weekly' => 7,
            'monthly' => 30,
            'yearly' => 365,
        };

        $currentEnd = Carbon::parse($booking->end_date);
        $newEndDate = $currentEnd->copy()->addDays($extensionDays);
        $checkStart = $currentEnd->copy()->addDay();

        $conflictExists = $booking->hasConflictForRange($checkStart, $newEndDate);

        if ($conflictExists) {
            return [
                'success' => false,
                'status_code' => 409,
                'message' => 'The extension period is not available.',
            ];
        }

        $booking->update(['end_date' => $newEndDate]);

        return [
            'success' => true,
            'status_code' => 200,
            'message' => 'Booking extended successfully.',
            'updatedBooking' => $booking,
        ];
    }
}
