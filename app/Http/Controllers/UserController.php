<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function userManagement(): Response
    {
        $bookingOptions = $this->getBookingOptions();
        $userOptions = $this->getUserOptions();

        return Inertia::render('user/user-management', compact('bookingOptions', 'userOptions'));
    }

    protected function getBookingOptions(): Collection
    {
        return Booking::select(['id', 'full_name'])
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'label' => "Booking #{$b->id} ({$b->full_name})",
            ]);
    }

    protected function getUserOptions(): Collection
    {
        return User::select(['id', 'name', 'email'])
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'label' => "{$u->name} ({$u->email})",
            ]);
    }
}
