<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Address;
use App\Models\Event;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use PHPUnit\Event\EventCollection;
use Throwable;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Collection
    {
        return Event::with(['organizer', 'address.city'])->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     * @throws Throwable
     */
    public function store(StoreEventRequest $request)
    {
        $addressId = $request->input('address_id');

        if (!$addressId) {
            $address = Address::firstOrCreate([
                'street' => $request->input('street'),
                'house_number' => $request->input('house_number'),
                'address_line' => $request->input('address_line'),
                'lat' => $request->input('lat'),
                'lng' => $request->input('lng'),
                'city_id' => $request->input('city_id'),
            ]);

            $addressId = $address->id;
        }

        $event = Event::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'user_id' => Auth::user()->id,
            'address_id' => $addressId,
            'lat' => $request->input('event_lat'),
            'lng' => $request->input('event_lng'),
            'starts_at' => $request->input('starts_at'),
            'ends_at' => $request->input('ends_at'),
        ]);

        return response()->json(['data' => $event], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        return ['data' => $event->load(['organizer', 'address'])];
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        //
    }
}
