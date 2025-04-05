<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminUploadContractTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_admin_can_upload_contract_file(): void
    {
        Storage::fake('local');

        $booking = Booking::factory()->create();
        $file = UploadedFile::fake()->create('contract.pdf', 200, 'application/pdf');

        $payload = [
            'booking_id' => $booking->id,
            'contract_file' => $file,
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/contracts', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Contract uploaded successfully.',
        ]);

        Storage::disk('local')->assertExists($booking->fresh()->contract_path);
    }

    public function test_contract_upload_requires_file_and_booking_id(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/contracts', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['booking_id', 'contract_file']);
    }

    public function test_non_admin_cannot_upload_contract(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $booking = Booking::factory()->create();
        $file = UploadedFile::fake()->create('contract.pdf', 200, 'application/pdf');

        $payload = [
            'booking_id' => $booking->id,
            'contract_file' => $file,
        ];

        $response = $this->actingAs($user)->postJson('/api/admin/contracts', $payload);

        $response->assertStatus(403);
    }

    public function test_upload_fails_with_invalid_file_type(): void
    {
        $booking = Booking::factory()->create();
        $file = UploadedFile::fake()->create('contract.exe', 200, 'application/x-msdownload');

        $payload = [
            'booking_id' => $booking->id,
            'contract_file' => $file,
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/contracts', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['contract_file']);
    }
}
