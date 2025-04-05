<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;

class AuthController extends Controller
{
    public function authenticate()
    {
        return response()->json([
            'token' => User::factory()->create()->createToken('postman-token')->plainTextToken,
        ]);
    }
}
