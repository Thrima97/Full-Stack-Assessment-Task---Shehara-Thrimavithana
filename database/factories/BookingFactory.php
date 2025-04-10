<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'package_id' => Package::factory(),
            'start_date' => $this->faker->dateTimeBetween('+1 days', '+10 days')->format('Y-m-d'),
            'end_date' => $this->faker->dateTimeBetween('+11 days', '+30 days')->format('Y-m-d'),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'full_name' => $this->faker->name(),
            'company_name' => $this->faker->company(),
            'telephone' => '077' . $this->faker->numberBetween(1000000, 9999999),
            'email' => $this->faker->unique()->safeEmail(),
            'address' => $this->faker->address(),
        ];
    }
}
