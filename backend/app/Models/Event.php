<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'address_id',
        'title',
        'description',
        'starts_at',
        'ends_at',
        'lat',
        'lng',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /**
     * Organizer of the event.
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Location of the event.
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    /**
     * Shortcut: get city directly through address.
     */
    public function city(): HasOneThrough|Event
    {
        return $this->hasOneThrough(
            City::class,
            Address::class,
            'id',          // Address.id
            'id',          // City.id
            'address_id',  // Event.address_id
            'city_id'      // Address.city_id
        );
    }
}
