<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractUploadedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function build(): self
    {
        return $this->subject('📎 Contract Uploaded')
            ->markdown('emails.booking.contract-uploaded')
            ->with(['booking' => $this->booking]);
    }
}
