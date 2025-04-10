<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function build(): self
    {
        return $this->subject('✅ Booking Confirmation')
            ->markdown('emails.booking.confirmation')
            ->with(['booking' => $this->booking]);
    }
}
