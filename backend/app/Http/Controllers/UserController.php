<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\JsonResponse;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $query = User::query();
        $search = $request->input('search', false);
        $role = $request->input('role', false);

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        if ($role) {
            $query->where('role', '=', $role);
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['role']) && $data['role'] === 'admin' && !Auth::user()->role->isAdmin()) {
            $data['role'] = 'user';
        }

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json(['data' => $user]);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['data' => $user]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['role']) && $data['role'] === 'admin' && !Auth::user()->role->isAdmin()) {
            $data['role'] = 'user';
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (Auth::user()->id === $user->id) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted'
        ]);
    }
}
