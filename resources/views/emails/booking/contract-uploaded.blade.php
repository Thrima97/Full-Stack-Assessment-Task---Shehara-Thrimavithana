@component('mail::message')
    # 📎 Contract Uploaded

    Hello {{ $booking->full_name }},

    We have successfully uploaded your contract for the booking below:

    - **Booking ID:** #{{ $booking->id }}
    - **Package:** {{ $booking->package->name }}
    - **Date Range:** {{ $booking->start_date }} → {{ $booking->end_date }}
    - **Status:** {{ ucfirst($booking->status) }}

    Thanks,
    **Workspace Booking Team**
@endcomponent
