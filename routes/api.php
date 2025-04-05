<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PackageController;
use App\Http\Middleware\EnsureIsAdmin;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    Route::get('packages', [PackageController::class, 'index'])->name('packages.index');
    Route::post('packages', [PackageController::class, 'store'])->name('packages.store');   
    
    Route::post('bookings', [BookingController::class, 'store'])->name('bookings');
    Route::get('bookings', [BookingController::class, 'bookings'])->name('bookings');
    
    Route::middleware(EnsureIsAdmin::class)->group(function () {
        Route::put('/packages/{id}', [PackageController::class, 'update'])->name('packages.update');
        Route::delete('/packages/{id}', [PackageController::class, 'destroy'])->name('packages.destroy');
        Route::post('booking-extend', [BookingController::class, 'extendBooking'])->name('booking-extend');
        Route::put('admin/bookings/{id}', [BookingController::class, 'updateStatus'])->name('bookings.updateStatus');
        Route::post('/admin/nic-details', [BookingController::class, 'storeNicDetails'])->name('nic.details.store');
        Route::post('/admin/contracts', [BookingController::class, 'uploadContract'])->name('contracts.upload');
    });
});

Route::post('/auth', [AuthController::class, 'authenticate']);
