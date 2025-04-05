<?php

namespace Tests\Feature\Booking;

use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateBookingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_authenticated_user_can_create_booking(): void
    {
        $package = Package::factory()->create();

        $payload = [
            'package_id' => $package->id,
            'start_date' => '2025-05-01',
            'end_date' => '2025-05-31',
            'price' => '100.00',
            'full_name' => 'John Doe',
            'company_name' => 'Acme Corp',
            'telephone' => '0777123456',
            'email' => 'john@example.com',
            'address' => '123 Main Street',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/bookings', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('bookings', [
            'package_id' => $package->id,
            'full_name' => 'John Doe',
            'email' => 'john@example.com',
        ]);
    }

    public function test_booking_requires_required_fields(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/bookings', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'package_id',
            'start_date',
            'end_date',
            'price',
            'full_name',
            'telephone',
            'email'
        ]);
    }

    public function test_booking_start_date_cannot_be_after_end_date(): void
    {
        $package = Package::factory()->create();

        $payload = [
            'package_id' => $package->id,
            'start_date' => '2025-06-01',
            'end_date' => '2025-05-01',
            'price' => '100.00',
            'full_name' => 'Invalid Date',
            'telephone' => '0777123456',
            'email' => 'invalid@example.com',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/bookings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['end_date']);
    }

    public function test_booking_email_must_be_valid(): void
    {
        $package = Package::factory()->create();

        $payload = [
            'package_id' => $package->id,
            'start_date' => '2025-05-01',
            'end_date' => '2025-05-31',
            'price' => '100.00',
            'full_name' => 'Invalid Email',
            'telephone' => '0777123456',
            'email' => 'not-an-email',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/bookings', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_unauthenticated_user_cannot_create_booking(): void
    {
        $package = Package::factory()->create();

        $payload = [
            'package_id' => $package->id,
            'start_date' => '2025-05-01',
            'end_date' => '2025-05-31',
            'price' => '100.00',
            'full_name' => 'Guest User',
            'telephone' => '0777123456',
            'email' => 'guest@example.com',
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(401);
    }
}
