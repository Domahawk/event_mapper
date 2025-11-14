<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role->isAdmin();
    }

    public function view(User $userModel): bool
    {
        $user = Auth::user();
        return $user->id === $userModel->id || $user->role->isAdmin();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $userModel): bool
    {
        $user = Auth::user();
        return $user->id === $userModel->id || $user->role->isAdmin();
    }

    public function delete(User $user, User $userModel): bool
    {
        return $user->id === $userModel->id || $user->role->isAdmin();
    }
}
