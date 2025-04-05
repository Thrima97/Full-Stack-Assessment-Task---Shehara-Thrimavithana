<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteUserToAdmin extends Command
{
    protected $signature = 'user:promote {email}';
    protected $description = 'Promote a user to admin by setting is_admin to 1';

    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("❌ User with email '{$email}' not found.");
            return 1;
        }

        $user->is_admin = 1;
        $user->save();

        $this->info("✅ User '{$user->name}' ({$user->email}) has been promoted to admin.");
        return 0;
    }
}
