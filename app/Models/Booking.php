<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\BookingStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'full_name',
        'company_name',
        'telephone',
        'email',
        'address',
        'start_date',
        'end_date',
        'price',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'status' => 'string',
    ];

    protected $with = ['package'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'booking_users')->withPivot('nic_number', 'company');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function attachNicDetails($userId, $nicNumber, $company = null): void
    {
        $this->users()->syncWithoutDetaching([
            $userId => [
                'nic_number' => $nicNumber,
                'company' => $company,
            ]
        ]);
    }

    public function saveContractPath(string $path): void
    {
        $this->contract_path = $path;
        $this->save();
    }

    public function attachUser(int $userId): void
    {
        $this->users()->attach($userId);
    }

    public function hasConflictForRange(Carbon $startDate, Carbon $endDate): bool
    {
        return self::where('package_id', $this->package_id)
            ->where('status', BookingStatus::Accepted->value)
            ->where('id', '!=', $this->id)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->exists();
    }

    public function hasDateConflict(): bool
    {
        return $this->hasConflictForRange(
            Carbon::parse($this->start_date),
            Carbon::parse($this->end_date)
        );
    }
}
