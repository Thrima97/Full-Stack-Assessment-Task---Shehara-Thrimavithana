<?php

namespace App\Listeners;

use App\Events\ContractUploaded;
use App\Mail\ContractUploadedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendContractUploadedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(ContractUploaded $event): void
    {
        $booking = $event->booking;
        $mail = new ContractUploadedMail($booking);

        if ($booking->email) {
            Mail::to($booking->email)->queue($mail);
        }

        foreach ($booking->users ?? [] as $user) {
            if ($user->email && $user->email !== $booking->email) {
                Mail::to($user->email)->queue($mail);
            }
        }
    }
}
