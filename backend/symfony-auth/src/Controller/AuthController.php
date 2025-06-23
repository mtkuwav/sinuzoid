<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\RefreshTokenService;
use App\Service\PasswordService;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager,
        RefreshTokenService $refreshTokenService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'])) {
            return $this->json([
                'error' => [
                    'code' => 'MISSING_CREDENTIALS',
                    'message' => 'Email and password are required',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        // Find user by email
        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        // Check if user exists and password is valid
        if (!$user || !$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json([
                'error' => [
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => 'Invalid email or password',
                ]
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Update last login timestamp
        $user->setLastLogin(new \DateTimeImmutable());
        $entityManager->flush();

        // Generate JWT token
        $token = $jwtManager->create($user);
        
        // Generate refresh token
        $refreshToken = $refreshTokenService->createRefreshToken($user);

        return $this->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
            ],
            'tokens' => [
                'access_token' => $token,
                'refresh_token' => $refreshToken->getToken(),
                'token_type' => 'Bearer',
                'expires_in' => 3600, // 1 hour
            ]
        ]);
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        PasswordService $passwordService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['username'], $data['email'], $data['password'])) {
            return $this->json([
                'error' => [
                    'code' => 'MISSING_FIELDS',
                    'message' => 'Username, email and password are required',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validate password strength
        $passwordErrors = $passwordService->validatePasswordStrength($data['password']);
        if (!empty($passwordErrors)) {
            return $this->json([
                'error' => [
                    'code' => 'WEAK_PASSWORD',
                    'message' => 'Password does not meet security requirements',
                    'details' => $passwordErrors,
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setUsername($data['username']);
        $user->setEmail($data['email']);
        $user->setRole('user');
        
        // Hash du mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Validation
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json([
                'error' => [
                    'code' => 'VALIDATION_FAILED',
                    'message' => 'Validation failed',
                    'details' => $errorMessages,
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'email' => $user->getEmail(),
                    'role' => $user->getRole(),
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => [
                    'code' => 'USER_CREATION_FAILED',
                    'message' => 'User creation failed',
                    'details' => $e->getMessage(),
                ]
            ], Response::HTTP_CONFLICT);
        }
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if (null === $user) {
            return $this->json([
                'error' => [
                    'code' => 'NOT_AUTHENTICATED',
                    'message' => 'Authentication required',
                ]
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
                'createdAt' => $user->getCreatedAt(),
                'lastLogin' => $user->getLastLogin(),
            ]
        ]);
    }

    #[Route('/api/refresh-token', name: 'api_refresh_token', methods: ['POST'])]
    public function refreshToken(
        Request $request,
        RefreshTokenService $refreshTokenService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['refresh_token'])) {
            return $this->json([
                'error' => [
                    'code' => 'MISSING_REFRESH_TOKEN',
                    'message' => 'Refresh token is required',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $tokens = $refreshTokenService->refreshAccessToken($data['refresh_token']);
            
            return $this->json([
                'message' => 'Token refreshed successfully',
                'tokens' => $tokens
            ]);
        } catch (\InvalidArgumentException $e) {
            return $this->json([
                'error' => [
                    'code' => 'INVALID_REFRESH_TOKEN',
                    'message' => 'Invalid or expired refresh token',
                ]
            ], Response::HTTP_UNAUTHORIZED);
        }
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(
        Request $request,
        RefreshTokenService $refreshTokenService,
        #[CurrentUser] ?User $user
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if ($data && isset($data['refresh_token'])) {
            // Revoke specific refresh token
            $refreshTokenService->revokeRefreshToken($data['refresh_token']);
        } elseif ($user) {
            // Revoke all refresh tokens for the user
            $refreshTokenService->revokeAllUserTokens($user);
        }

        return $this->json([
            'message' => 'Logged out successfully'
        ]);
    }

    #[Route('/api/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(
        Request $request,
        PasswordService $passwordService,
        #[CurrentUser] ?User $user
    ): JsonResponse {
        if (null === $user) {
            return $this->json([
                'error' => [
                    'code' => 'NOT_AUTHENTICATED',
                    'message' => 'Authentication required',
                ]
            ], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['current_password'], $data['new_password'])) {
            return $this->json([
                'error' => [
                    'code' => 'MISSING_FIELDS',
                    'message' => 'Current password and new password are required',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validate new password strength
        $passwordErrors = $passwordService->validatePasswordStrength($data['new_password']);
        if (!empty($passwordErrors)) {
            return $this->json([
                'error' => [
                    'code' => 'WEAK_PASSWORD',
                    'message' => 'New password does not meet security requirements',
                    'details' => $passwordErrors,
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $success = $passwordService->changePassword(
            $user,
            $data['current_password'],
            $data['new_password']
        );

        if (!$success) {
            return $this->json([
                'error' => [
                    'code' => 'INVALID_CURRENT_PASSWORD',
                    'message' => 'Current password is incorrect',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'message' => 'Password changed successfully'
        ]);
    }

    #[Route('/api/request-password-reset', name: 'api_request_password_reset', methods: ['POST'])]
    public function requestPasswordReset(
        Request $request,
        PasswordService $passwordService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'])) {
            return $this->json([
                'error' => [
                    'code' => 'MISSING_EMAIL',
                    'message' => 'Email is required',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        // Create password reset token (returns null if user doesn't exist)
        $token = $passwordService->createPasswordResetToken($data['email']);

        // Always return success to avoid revealing if email exists
        return $this->json([
            'message' => 'If the email exists, a password reset link has been sent',
            // In production, you would send an email here
            // For testing purposes, we include the token
            'reset_token' => $token ? $token->getToken() : null
        ]);
    }

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        PasswordService $passwordService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['token'], $data['new_password'])) {
            return $this->json([
                'error' => [
                    'code' => 'MISSING_FIELDS',
                    'message' => 'Reset token and new password are required',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validate new password strength
        $passwordErrors = $passwordService->validatePasswordStrength($data['new_password']);
        if (!empty($passwordErrors)) {
            return $this->json([
                'error' => [
                    'code' => 'WEAK_PASSWORD',
                    'message' => 'New password does not meet security requirements',
                    'details' => $passwordErrors,
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $success = $passwordService->resetPassword($data['token'], $data['new_password']);

        if (!$success) {
            return $this->json([
                'error' => [
                    'code' => 'INVALID_RESET_TOKEN',
                    'message' => 'Invalid or expired reset token',
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'message' => 'Password reset successfully'
        ]);
    }
}
