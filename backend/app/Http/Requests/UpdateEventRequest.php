<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'lat' => ['required','numeric','between:-90,90'],
            'lng' => ['required','numeric','between:-180,180'],
            'starts_at' => ['required','date'],
            'ends_at' => ['required','date'],
            'street' => ['required','string','max:255'],
            'house_number' => ['nullable','string','max:255'],
            'address_line' => ['required','string','max:255'],
            'event_lat' => ['required','numeric','between:-90,90'],
            'event_lng' => ['required','numeric','between:-180,180'],
            'address_id' => ['nullable','exists:addresses,id'],
            'city_id' => ['nullable','exists:cities,id'],
        ];
    }
}
