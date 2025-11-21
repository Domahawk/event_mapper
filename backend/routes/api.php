<?php

use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\UserController;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Session create/destroy endpoints (need web stack)
Route::middleware('web')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events', [EventController::class, 'store'])->can('create', Event::class);
    Route::put('/events/{event}', [EventController::class, 'update'])->can('update', 'event');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->can('delete', 'event');

    Route::get('/user', fn (Request $request) => Auth::user());
    Route::get('users', [UserController::class, 'index'])->can('view-any', User::class);
    Route::get('users/{user}', [UserController::class, 'show'])->can('view', 'user');
    Route::put('users/{user}', [UserController::class, 'update'])->can('update', 'user');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->can('delete', 'user');
});

Route::post('users', [UserController::class, 'store']);
Route::get('/reverse', [GeocodeController::class, 'reverse']);
Route::get('/geocode', [GeocodeController::class, 'geocode']);
