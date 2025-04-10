<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'package_id'    => 'required|exists:packages,id',
            'start_date'    => 'required|date|after_or_equal:today',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'price'         => 'required|numeric|min:0.01',
            'full_name'     => 'required|string|max:255',
            'company_name'  => 'nullable|string|max:255',
            'telephone'     => ['required', 'regex:/^(\+94|0)?[0-9]{9}$/'],
            'email'         => 'required|email|max:255',
            'address'       => 'nullable|string|max:1000',
        ];
    }
}

