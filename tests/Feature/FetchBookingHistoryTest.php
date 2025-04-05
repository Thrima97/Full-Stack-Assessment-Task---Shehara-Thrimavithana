<?php

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FetchBookingHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_fetch_their_own_booking_history(): void
    {
        $package = Package::factory()->create();

        $booking1 = Booking::factory()->create(['package_id' => $package->id]);
        $booking2 = Booking::factory()->create(['package_id' => $package->id]);

        $booking1->users()->attach($this->user->id, [
            'nic_number' => '123456789V',
            'company' => 'TestCo',
        ]);
        $booking2->users()->attach($this->user->id, [
            'nic_number' => '987654321V',
            'company' => 'TestCo',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/bookings?user_id=' . $this->user->id);

        $response->assertOk();
        $response->assertJsonCount(2, 'bookings');

        $response->assertJsonStructure([
            'bookings' => [
                '*' => [
                    'id',
                    'package_id',
                    'start_date',
                    'end_date',
                    'price',
                    'full_name',
                    'email'
                ],
            ],
        ]);
    }

    public function test_user_with_no_bookings_receives_empty_list(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/bookings?user_id=' . $this->user->id);

        $response->assertOk();
        $response->assertJson(['bookings' => []]);
    }

    public function test_booking_history_requires_valid_user_id(): void
    {
        $invalidUserId = 9999;

        $response = $this->actingAs($this->user)->getJson('/api/bookings?user_id=' . $invalidUserId);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['user_id']);
    }

    public function test_unauthenticated_user_cannot_fetch_bookings(): void
    {
        $response = $this->getJson('/api/bookings?user_id=' . $this->user->id);
        $response->assertStatus(401);
    }

    public function test_booking_response_contains_package_data(): void
    {
        $package = Package::factory()->create(['name' => 'Executive Suite']);
        $booking = Booking::factory()->create(['package_id' => $package->id]);

        $booking->users()->attach($this->user->id, [
            'nic_number' => '123456789V',
            'company' => 'TestCo',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/bookings?user_id=' . $this->user->id);

        $response->assertOk();
        $response->assertJsonFragment([
            'package_id' => $package->id,
            'name' => 'Executive Suite',
        ]);
    }
}
