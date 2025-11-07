<?php

namespace App\Services;

use App\Models\Address;
use App\Models\City;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GeocodeService
{
    private function base(): string
    {
        return rtrim(config('Services.geocoder.base_url', 'https://nominatim.openstreetmap.org'));
    }

    private function http()
    {
        return Http::withHeaders([
            // Nominatim politely asks for identifying UA
            'User-Agent' => config('app.name', 'EventMapper').' ('.config('app.url', 'http://localhost').')',
        ])->timeout(8);
    }

    private function getAddressByLatLngFromDb(float $lat, float $lng): Address | null
    {
        $radius = 10;
        $limit = 15;

        $latDelta = $radius / 111320;
        $lngDelta = $radius / (111320 * max(0.00001, cos(deg2rad($lat))));

        $nearby = Address::query()
            ->whereBetween('lat', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('lng', [$lng - $lngDelta, $lng + $lngDelta])
            ->select(['id', 'street', 'house_number', 'lat', 'lng'])
            ->selectRaw(
                '(
                    6371000 * ACOS(
                        COS(
                            RADIANS(?)) * COS(RADIANS(lat)
                        ) * COS(
                            RADIANS(lng) - RADIANS(?)
                        ) + SIN(
                            RADIANS(?)
                        ) * SIN(
                            RADIANS(lat)
                        )
                    )
                ) AS distance',
                [$lat, $lng, $lat]
            )
            ->having('distance', '<=', $radius)
            ->orderBy('distance')
            ->limit($limit)
            ->get();

        if ($nearby->isEmpty()) {
            return null;
        }

        return $nearby->min('distance');
    }

    private function storeAddresses(Collection $candidates): Collection
    {
        if ($candidates->isEmpty()) {
            return collect();
        }

        $saved = collect();

        foreach ($candidates as $cand) {
            $cityName = trim((string) ($cand['city_name'] ?? ''));

            $cityId = null;
            if ($cityName !== '') {
                $cityId = City::query()
                    ->whereRaw('LOWER(name) = ?', [Str::lower($cityName)])
                    ->value('id');
            }

            $address = Address::firstOrCreate(
                $this->serializeAddress($cand),
                [
                    'city_id' => $cityId ?? null,
                ]
            );

            $saved->push($address);
        }

        return $saved;
    }

    /**
     * @throws ConnectionException
     */
    public function lookupAddressesByStreet(string $street): Collection
    {
        $db = Address::query()
            ->where('street', 'like', '%'.$street.'%')
            ->orderBy('street')
            ->limit(10)
            ->get();

        if ($db->isNotEmpty()) {
            return collect($db->map(fn(Address $a) => $this->serializeAddress($a))->values());
        }

        $resp = $this->http()->get($this->base().'/search', [
            'street' => "$street",
            'format' => 'jsonv2',
            'limit' => 5,
            'layer' => 'address',
            'addressdetails' => 1,
            'countrycodes' => 'hr',
        ]);

        if (!$resp->ok()) {
            return collect();
        }

        return collect($resp->json())->map(fn ($i) => $this->serializeNormatimResponse($i));
    }

    /**
     * @throws ConnectionException
     */
    public function lookupAddressByLatLng(float $lat, float $lng): array
    {
        $nearby = $this->getAddressByLatLngFromDb($lat, $lng);

        if ($nearby !== null) {
            return $this->serializeAddress($nearby);
        }

        $resp = $this->http()->get($this->base().'/reverse', [
            'lat' => $lat,
            'lon' => $lng,
            'format' => 'jsonv2',
            'addressdetails' => 1,
            'layer' => 'address'
        ]);

        if (!$resp->ok()) {
            return [];
        }

        return $this->serializeNormatimResponse($resp->json());
    }

    public function serializeAddress(Address | array $address): array
    {
        if ($address instanceof Address) {
            return [
                'id' => $address->id,
                'street' => $address->street,
                'house_number' => $address->house_number,
                'address_line' => $address->address_line,
                'lat' => (float) $address->lat,
                'lng' => (float) $address->lng,
            ];
        }

        $cityName = trim((string) ($address['city_name'] ?? ''));

        $cityId = null;
        if ($cityName !== '') {
            $cityId = City::query()
                ->whereRaw('LOWER(name) = ?', [Str::lower($cityName)])
                ->value('id');
        }

        return [
            'street' => $address['street'],
            'house_number' => $address['number'],
            'address_line' => $address['address_line'],
            'lat' => $address['lat'],
            'lng' => $address['lng'],
        ];
    }

    private function serializeNormatimResponse(array $address): array
    {
        return [
            'street' => $address['address']['road'] ?? null,
            'house_number' => $address['address']['house_number'] ?? null,
            'address_line' => $address['display_name'],
            'lat' => $address['lat'],
            'lng' => $address['lon'],
        ];
    }
}
