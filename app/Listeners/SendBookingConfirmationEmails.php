<?php

namespace App\Listeners;

use App\Events\BookingCreated;
use App\Mail\BookingConfirmationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendBookingConfirmationEmails implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(BookingCreated $event): void
    {
        $booking = $event->booking;
        $mail = new BookingConfirmationMail($booking);

        if ($booking->email) {
            Mail::to($booking->email)->queue($mail);
        }

        if ($booking->users && $booking->users->count()) {
            foreach ($booking->users as $user) {
                if ($user->email && $user->email !== $booking->email) {
                    Mail::to($user->email)->queue($mail);
                }
            }
        }
    }
}
