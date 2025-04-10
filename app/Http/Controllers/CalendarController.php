<?php

namespace App\Http\Controllers;

use App\Enums\SeatCount;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function calendarView()
    {
        return Inertia::render('calendar/calendar', [
            'seatCounts' => SeatCount::toOptions(),
        ]);
    }
}
