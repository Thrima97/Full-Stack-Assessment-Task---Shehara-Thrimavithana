<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAddNicDetailsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $targetUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->targetUser = User::factory()->create();
    }

    public function test_admin_can_add_nic_details_to_booking(): void
    {
        $booking = Booking::factory()->create();

        $payload = [
            'booking_id' => $booking->id,
            'user_id' => $this->targetUser->id,
            'nic_number' => '987654321V',
            'company' => 'TestCo Ltd',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/nic-details', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'NIC details added to booking.',
        ]);

        $this->assertDatabaseHas('booking_users', [
            'booking_id' => $booking->id,
            'user_id' => $this->targetUser->id,
            'nic_number' => '987654321V',
            'company' => 'TestCo Ltd',
        ]);
    }

    public function test_nic_details_requires_required_fields(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/nic-details', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'booking_id', 'user_id', 'nic_number'
        ]);
    }

    public function test_non_admin_cannot_add_nic_details(): void
    {
        $nonAdmin = User::factory()->create(['is_admin' => false]);
        $booking = Booking::factory()->create();

        $payload = [
            'booking_id' => $booking->id,
            'user_id' => $this->targetUser->id,
            'nic_number' => '987654321V',
            'company' => 'TestCo Ltd',
        ];

        $response = $this->actingAs($nonAdmin)->postJson('/api/admin/nic-details', $payload);

        $response->assertStatus(403);
    }
}
