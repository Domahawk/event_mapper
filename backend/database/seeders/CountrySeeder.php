<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/countries.json');
        $countries = json_decode(file_get_contents($path), true);

        $data = array_map(fn($country) => [
            'name' => $country['name'],
            'iso2' => $country['iso2'],
            'iso3' => $country['iso3'],
            'created_at' => now(),
            'updated_at' => now(),
        ], $countries);

        foreach ($data as $country) {
            Country::factory()->create($country);
        }
    }
}
