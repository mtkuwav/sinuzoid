<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/login',
            summary: 'Authenticate user and get JWT tokens',
            description: 'Login with email and password to receive JWT tokens',
            controller: 'App\Controller\AuthController::login'
        )
    ],
    shortName: 'Login'
)]
class LoginResource
{
    public function __construct(
        public ?string $email = null,
        public ?string $password = null,
        public ?string $token = null,
        public ?string $refresh_token = null,
        public ?array $user = null
    ) {
    }
}
