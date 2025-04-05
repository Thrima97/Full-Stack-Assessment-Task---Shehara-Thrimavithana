<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUpdateBookingStatusTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_admin_can_accept_booking(): void
    {
        $this->user->is_admin = true;
        $this->user->save();

        $booking = Booking::factory()->create([
            'status' => 'pending',
        ]);

        $payload = ['status' => 'accepted'];

        $response = $this->actingAs($this->user)->putJson("/api/admin/bookings/{$booking->id}", $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => "Booking #{$booking->id} updated to 'accepted'",
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'accepted',
        ]);
    }

    public function test_admin_cannot_accept_booking_if_date_conflict_exists(): void
    {
        $this->user->is_admin = true;
        $this->user->save();

        $package = Package::factory()->create();

        Booking::factory()->create([
            'package_id' => $package->id,
            'start_date' => '2025-05-01',
            'end_date' => '2025-05-10',
            'status' => 'accepted',
        ]);

        $bookingToUpdate = Booking::factory()->create([
            'package_id' => $package->id,
            'start_date' => '2025-05-05',
            'end_date' => '2025-05-15',
            'status' => 'pending',
        ]);

        $payload = ['status' => 'accepted'];

        $response = $this->actingAs($this->user)
            ->putJson("/api/admin/bookings/{$bookingToUpdate->id}", $payload);

        $response->assertStatus(409);
        $response->assertJson([
            'success' => false,
            'message' => 'Booking cannot be approved because the selected date range is already reserved.',
        ]);
    }

    public function test_non_admin_cannot_update_booking_status(): void
    {
        $this->user->is_admin = false;
        $this->user->save();

        $booking = Booking::factory()->create();

        $payload = ['status' => 'rejected'];

        $response = $this->actingAs($this->user)
            ->putJson("/api/admin/bookings/{$booking->id}", $payload);

        $response->assertStatus(403);
    }

    public function test_invalid_status_value_returns_validation_error(): void
    {
        $this->user->is_admin = true;
        $this->user->save();

        $booking = Booking::factory()->create();

        $payload = ['status' => 'unknown'];

        $response = $this->actingAs($this->user)
            ->putJson("/api/admin/bookings/{$booking->id}", $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    }
}
