<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:packages,name,' . $this->route('id'),
            'seat' => 'required|integer|min:1',
            'description' => 'nullable|string|max:1000',
        ];
    }
}
