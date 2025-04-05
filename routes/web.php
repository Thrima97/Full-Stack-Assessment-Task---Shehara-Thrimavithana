<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureIsAdmin;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified', 'throttle:60,1'])->group(function () {

    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/download-contract/{filename}', [FileController::class, 'download'])->name('download.contract');

    Route::get('/user', fn() => redirect()->route('user.calendar.view'))->name('user');
    Route::prefix('user')->name('user.')->group(function () {
        Route::get('/calendar-view', [CalendarController::class, 'calendarView'])->name('calendar.view');
        Route::get('/booking-form', [BookingController::class, 'bookingForm'])->name('booking.form');
        Route::get('/dashboard', [BookingController::class, 'dashboard'])->name('dashboard');
    });

    Route::middleware(EnsureIsAdmin::class)->group(function () {
        Route::get('/admin', fn() => redirect()->route('admin.calendar.view'))->name('admin');
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/calendar-view', [CalendarController::class, 'calendarView'])->name('calendar.view');
            Route::get('/booking-management', [BookingController::class, 'bookingManagement'])->name('booking.management');
            Route::get('/user-management', [UserController::class, 'userManagement'])->name('user-management');
            Route::get('/package-management', [PackageController::class, 'packageManagement'])->name('package-management');
            Route::get('/reports-and-analytics', [ReportController::class, 'reportsAndAnalytics'])->name('reports.and.analytics');
        });
    });

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
