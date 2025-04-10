<?php

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExtendBookingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_admin_can_extend_booking_successfully(): void
    {
        $this->user->is_admin = true;
        $this->user->save();

        $booking = Booking::factory()->create([
            'end_date' => now()->addDays(5)->toDateString(),
        ]);

        $payload = [
            'booking_id' => $booking->id,
            'duration' => 'weekly',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/booking-extend', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Booking extended successfully.',
        ]);

        $booking->refresh();
        $expectedEnd = now()->addDays(12)->toDateString();
        $this->assertEquals($expectedEnd, $booking->end_date->toDateString());
    }

    public function test_booking_extension_fails_if_conflict_exists(): void
    {
        $this->user->is_admin = true;
        $this->user->save();

        $package = Package::factory()->create();

        $booking = Booking::factory()->create([
            'package_id' => $package->id,
            'end_date' => now()->addDays(5)->toDateString(),
            'status' => 'accepted',
        ]);

        Booking::factory()->create([
            'package_id' => $package->id,
            'start_date' => now()->addDays(7)->toDateString(),
            'end_date' => now()->addDays(20)->toDateString(),
            'status' => 'accepted',
        ]);

        $payload = [
            'booking_id' => $booking->id,
            'duration' => 'monthly',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/booking-extend', $payload);

        $response->assertStatus(409);
        $response->assertJson([
            'success' => false,
            'message' => 'The extension period is not available.',
        ]);
    }

    public function test_invalid_duration_returns_validation_error(): void
    {
        $this->user->is_admin = true;
        $this->user->save();

        $booking = Booking::factory()->create();

        $payload = [
            'booking_id' => $booking->id,
            'duration' => '10-days',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/booking-extend', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['duration']);
    }

    public function test_non_admin_user_cannot_extend_booking(): void
    {
        $this->user->is_admin = false;
        $this->user->save();

        $booking = Booking::factory()->create([
            'end_date' => now()->addDays(3)->toDateString(),
        ]);

        $payload = [
            'booking_id' => $booking->id,
            'duration' => 'weekly',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/booking-extend', $payload);

        $response->assertStatus(403);
    }
}
