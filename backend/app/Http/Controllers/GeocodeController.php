<?php

namespace App\Http\Controllers;

use App\Services\GeocodeService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class GeocodeController extends Controller
{
    public function __construct(private readonly GeocodeService $geocodeService) {}

    /**
     * @throws ConnectionException
     */
    public function geocode(Request $request)
    {
        $street = $request->query('address');

        return response()->json([
            'data' => $this->geocodeService->lookupAddressesByStreet($street)
        ]);
    }

    /**
     * @throws ConnectionException
     */
    public function reverse(Request $request)
    {
        $lat = (float) $request->query('lat');
        $lng = (float) $request->query('lng');

        return response()->json(['data' => $this->geocodeService->lookupAddressByLatLng($lat, $lng)]);
    }
}
