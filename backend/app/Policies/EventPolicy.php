<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EventPolicy
{
    public function viewAny(): bool
    {
        return true;
    }

    public function view(): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->exists();
    }

    public function update(User $user, Event $event): bool
    {
        return $event->user_id === $user->id || $user->role->isAdmin();
    }

    public function delete(User $user, Event $event): bool
    {
        return $event->user_id === $user->id || $user->role->isAdmin();
    }
}
