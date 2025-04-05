<?php

namespace App\Http\Controllers;

use App\Enums\BookingExtendRange;
use App\Events\BookingCreated;
use App\Events\ContractUploaded;
use App\Http\Requests\ExtendBookingRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\StoreNicDetailsRequest;
use App\Http\Requests\UpdateBookingStatusRequest;
use App\Http\Requests\UploadContractRequest;
use App\Http\Requests\UserBookingRequest;
use App\Services\BookingService;
use App\Traits\LogsErrors;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BookingController extends Controller
{
    use LogsErrors;

    public function __construct(protected BookingService $bookingService) {}

    public function storeNicDetails(StoreNicDetailsRequest $request)
    {
        $data = $request->validated();

        try {
            $this->bookingService->addNicDetails($data);

            return response()->json([
                'success' => true,
                'message' => 'NIC details added to booking.'
            ]);
        } catch (\Throwable $e) {
            $this->logError('Failed to store NIC details', $e, $data);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add NIC details. Please try again later.'
            ], 500);
        }
    }

    public function uploadContract(UploadContractRequest $request)
    {
        try {
            $booking = $this->bookingService->uploadContract(
                $request->validated('booking_id'),
                $request->file('contract_file')
            );

            Log::debug("Contract uploaded", [
                'booking_id' => $booking,
                'path' => $booking->contract_path,
            ]);
            event(new ContractUploaded($booking));

            return response()->json([
                'success' => true,
                'message' => 'Contract uploaded successfully.',
                'path' => $booking->contract_path,
            ]);
        } catch (\Throwable $e) {
            $this->logError('Contract upload failed', $e, [
                'booking_id' => $request->input('booking_id'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload contract.',
            ], 500);
        }
    }

    public function bookingManagement()
    {
        $bookings = $this->bookingService->getBookingManagementData();

        $extendRanges = BookingExtendRange::options();

        return Inertia::render('booking/booking-management', compact('bookings', 'extendRanges'));
    }

    public function bookingForm()
    {
        return Inertia::render('booking/booking-form');
    }

    public function dashboard()
    {
        return Inertia::render('booking/dashboard');
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->createBooking($request->validated());

            return response()->json([
                'message' => 'Booking request created successfully!',
                'data' => $booking
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Booking creation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Something went wrong while creating the booking. Please try again.'
            ], 500);
        }
    }


    public function bookings(UserBookingRequest $request)
    {
        $bookings = $this->bookingService->getBookingsForUser($request->validated('user_id'));

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, $id)
    {
        $status = $request->validated('status');

        $result = $this->bookingService->updateStatus($id, $status);

        if ($result['success'] && isset($result['updatedBooking'])) {
            event(new BookingCreated($result['updatedBooking']));
        }

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'updatedBooking' => $result['updatedBooking'] ?? null,
        ], $result['status_code']);
    }


    public function extendBooking(ExtendBookingRequest $request): JsonResponse
    {
        try {
            $result = $this->bookingService->extendBooking(
                $request->validated('booking_id'),
                $request->validated('duration')
            );

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'updatedBooking' => $result['updatedBooking'] ?? null,
            ], $result['status_code']);
        } catch (\Throwable $e) {
            Log::error('Booking extension failed', [
                'booking_id' => $request->input('booking_id'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while extending the booking.',
            ], 500);
        }
    }
}
