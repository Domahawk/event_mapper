<?php

namespace App\Enums;

enum Role: string
{
    case ADMIN = 'admin';
    case USER  = 'user';

    public function isAdmin(): bool
    {
       return $this === self::ADMIN;
    }
}
