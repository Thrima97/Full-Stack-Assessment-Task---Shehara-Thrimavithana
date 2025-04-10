<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function download(string $filename)
    {
        $path = "contracts/{$filename}";

        if (!Storage::disk('local')->exists($path)) {
            Log::warning("Download failed: File not found - {$path}");
            abort(404, 'File not found.');
        }

        try {
            return Storage::disk('local')->download($path);
        } catch (\Throwable $e) {
            Log::error("File download failed for {$path}: {$e->getMessage()}", [
                'exception' => $e,
            ]);
            abort(500, 'Unable to download file.');
        }
    }
}
