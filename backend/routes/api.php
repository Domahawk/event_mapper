<?php

use App\Http\Controllers\GeocodeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Session create/destroy endpoints (need web stack)
Route::middleware('web')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::get('/events', [EventController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/user', fn (Request $request) => $request->user());
});

Route::get('/reverse', [GeocodeController::class, 'reverse']);
Route::get('/geocode', [GeocodeController::class, 'geocode']);
