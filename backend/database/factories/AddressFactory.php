<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
        'city_id' => 661,
        'street' => $this->faker->streetName,
        'house_number' => $this->faker->numberBetween(1,20),
        'address_line' => $this->faker->address,
        'lat' => City::where('id', 661)->first()->lat + $this->faker->randomFloat(10, -0.01999, 0.01999),
        'lng' => City::where('id', 661)->first()->lng + $this->faker->randomFloat(10, -0.01999, 0.01999),
        ];
    }
}
