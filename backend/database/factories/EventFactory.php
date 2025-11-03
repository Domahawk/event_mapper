<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
        'user_id' => 1,
        'address_id' => $this->faker->numberBetween(1, 10),
        'title' => $this->faker->name(),
        'description' => $this->faker->text(),
        'starts_at' => now(),
        'ends_at' => now(),
        ];
    }
}
