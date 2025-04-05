<?php

namespace App\Enums;

enum BookingExtendRange: string
{
    case Daily = 'daily';
    case TwoDay = '2-day';
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function label(): string
    {
        return match ($this) {
            self::Daily => '+1 Day',
            self::TwoDay => '+2 Days',
            self::Weekly => '+1 Week',
            self::Monthly => '+1 Month',
            self::Yearly => '+1 Year',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn($case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases()
        );
    }
}
