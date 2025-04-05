<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;


class PackageFactory extends Factory
{

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'seat' => $this->faker->randomElement([5, 10, 15]),
            'description' => $this->faker->sentence,
        ];
    }
}
