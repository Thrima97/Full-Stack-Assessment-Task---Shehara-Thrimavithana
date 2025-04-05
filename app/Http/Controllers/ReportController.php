<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function reportsAndAnalytics(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');
    
        $packages = Package::with(['bookings' => function ($query) use ($start, $end) {
            $query->where('status', 'accepted');
    
            if ($start && $end) {
                $query->whereBetween('start_date', [$start, $end]);
            }
        }])->get();

        return Inertia::render('report/reports-and-analytics', [
            'packages' => $packages,
        ]);
    }
}
