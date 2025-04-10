@component('mail::message')
    # ✅ Booking Confirmation

    Hello **{{ $booking->full_name }}**,

    Your booking has been successfully received! Below are your booking details:

    ---

    ## 📋 Booking Summary

    - **Booking ID:** #{{ $booking->id }}
    - **Full Name:** {{ $booking->full_name }}
    @if ($booking->company_name)
        - **Company:** {{ $booking->company_name }}
    @endif
    - **Package:** {{ $booking->package->name }}
    - **Date Range:** 📅 {{ $booking->start_date }} → {{ $booking->end_date }}
    - **Price:** 💰 LKR {{ number_format($booking->price, 2) }}
    - **Status:** {{ ucfirst($booking->status) }}

    ---

    If you have any questions or need assistance, feel free to reach out to our support team.

    Thanks again!
    **Workspace Booking Team**
@endcomponent
