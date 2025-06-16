<?php

namespace App\Service;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use App\Repository\PasswordResetTokenRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PasswordResetTokenRepository $passwordResetTokenRepository,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function createPasswordResetToken(string $email): ?PasswordResetToken
    {
        $user = $this->userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            // For security reasons, don't reveal if the email exists or not
            return null;
        }

        // Invalidate all existing tokens for this user
        $this->passwordResetTokenRepository->invalidateAllUserTokens($user);

        $token = new PasswordResetToken();
        $token->setUser($user);

        $this->passwordResetTokenRepository->save($token, true);

        return $token;
    }

    public function resetPassword(string $token, string $newPassword): bool
    {
        $resetToken = $this->passwordResetTokenRepository->findValidTokenByToken($token);

        if (!$resetToken || !$resetToken->isValid()) {
            return false;
        }

        $user = $resetToken->getUser();
        
        // Hash and set the new password
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        // Mark token as used
        $resetToken->markAsUsed();

        // Invalidate all other reset tokens for this user
        $this->passwordResetTokenRepository->invalidateAllUserTokens($user);

        $this->entityManager->flush();

        return true;
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        // Verify current password
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return false;
        }

        // Hash and set new password
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        $this->entityManager->flush();

        return true;
    }

    public function isPasswordValid(User $user, string $password): bool
    {
        return $this->passwordHasher->isPasswordValid($user, $password);
    }

    public function validatePasswordStrength(string $password): array
    {
        $errors = [];

        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }

        return $errors;
    }

    public function cleanupExpiredTokens(): int
    {
        return $this->passwordResetTokenRepository->cleanupExpiredTokens();
    }
}
