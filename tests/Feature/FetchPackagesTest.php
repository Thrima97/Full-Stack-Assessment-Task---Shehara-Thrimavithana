<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FetchPackagesTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_authenticated_user_can_view_packages(): void
    {
        Package::factory()->count(3)->create();
        $response = $this->actingAs($this->user)->getJson('/api/packages');
        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'seat',
                    'description',
                ],
            ],
        ]);
    }

    public function test_unauthenticated_user_cannot_view_packages(): void
    {
        $response = $this->getJson('/api/packages');

        $response->assertStatus(401);
    }

    public function test_it_returns_empty_array_when_no_packages_exist(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/packages');

        $response->assertOk();
        $response->assertJson([
            'data' => [],
        ]);
    }

    public function test_it_returns_correct_package_data(): void
    {
        Package::factory()->create([
            'name' => 'Private Office',
            'seat' => 5,
            'description' => 'Ideal for startups',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/packages');

        $response->assertOk();
        $response->assertJsonFragment([
            'name' => 'Private Office',
            'seat' => 5,
            'description' => 'Ideal for startups',
        ]);
    }
}
