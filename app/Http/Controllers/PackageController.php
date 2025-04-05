<?php

namespace App\Http\Controllers;

use App\Enums\SeatCount;
use App\Http\Requests\StorePackageRequest;
use App\Http\Requests\UpdatePackageRequest;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function packageManagement(): Response
    {
        return Inertia::render('package/package-management', [
            'seatOptions' => SeatCount::toOptions(),
        ]);
    }

    public function index(): JsonResponse
    {
        $packages = Package::with(['bookings' => fn($q) => $q->where('status', 'accepted')])->get();

        $formatted = $packages->map(fn($package) => [
            'id' => $package->id,
            'name' => $package->name,
            'seat' => $package->seat,
            'description' => $package->description,
            'booked' => $package->bookings->map(fn($booking) => [
                'start_date' => $booking->start_date?->toDateString(),
                'end_date' => $booking->end_date?->toDateString(),
            ]),
        ]);

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    public function store(StorePackageRequest $request): JsonResponse
    {
        try {
            $package = Package::create($request->validated());

            return response()->json([
                'success' => true,
                'data' => $package,
            ]);
        } catch (\Throwable $e) {
            Log::error('Package creation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while creating the package.',
            ], 500);
        }
    }

    public function update(UpdatePackageRequest $request, $id): JsonResponse
    {
        $package = Package::findOrFail($id);

        try {
            $package->update($request->validated());

            return response()->json([
                'success' => true,
                'data' => $package,
            ]);
        } catch (\Throwable $e) {
            Log::error("Package update failed (ID: $id)", ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update package.',
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        $package = Package::findOrFail($id);

        try {
            $package->delete();

            return response()->json([
                'success' => true,
                'message' => 'Package deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error("Package deletion failed (ID: $id)", ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete package.',
            ], 500);
        }
    }
}
