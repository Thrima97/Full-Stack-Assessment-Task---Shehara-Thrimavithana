<?php

use App\Enums\BookingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('company_name')->nullable();
            $table->string('telephone');
            $table->string('email');
            $table->text('address')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('price', 10, 2);
            $table->enum('status', [
                BookingStatus::Pending->value,
                BookingStatus::Rejected->value,
                BookingStatus::Accepted->value,
            ])->default(BookingStatus::Pending->value);
            $table->string('contract_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
