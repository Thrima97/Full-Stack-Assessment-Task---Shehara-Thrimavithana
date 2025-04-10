<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;

trait LogsErrors
{
    public function logError(string $context, \Throwable $e, array $extra = []): void
    {
        Log::error($context, array_merge([
            'error' => $e->getMessage(),
        ], $extra));
    }
}

