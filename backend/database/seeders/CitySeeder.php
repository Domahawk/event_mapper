<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use JsonMachine\Exception\InvalidArgumentException;
use JsonMachine\Items;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * @throws InvalidArgumentException
     */
    public function run(): void
    {
        $path = database_path('seeders/data/cities.json');

        // Stream JSON objects from the file — no full decode
        $cities = Items::fromFile($path);

        foreach ($cities as $city) {
            if ($city->country_code !== 'HR') {
                continue;
            }
            $data = [
                'name' => $city->name,
                'country_id' => Country::where('name', $city->country_name)->first()->id,
                'lat' => $city->latitude ?? null,
                'lng' => $city->longitude ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            City::factory()->create($data);
        }
    }
}
