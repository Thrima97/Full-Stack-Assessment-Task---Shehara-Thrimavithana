<?php

namespace App\Enums;

enum SeatCount: int
{
    case Five = 5;
    case Ten = 10;
    case Fifteen = 15;

    public static function toOptions(): array
    {
        return array_map(fn($case) => [
            'label' => match ($case) {
                self::Five => '5 Seats',
                self::Ten => '10 Seats',
                self::Fifteen => '15 Seats',
            },
            'value' => $case->value,
        ], self::cases());
    }
}
