<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNicDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_id' => 'required|exists:bookings,id',
            'nic_number' => 'required|string|max:12',
            'company' => 'nullable|string|max:255',
            'user_id' => 'required|exists:users,id',
        ];
    }
}
