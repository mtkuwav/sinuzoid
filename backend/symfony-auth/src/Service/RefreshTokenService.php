<?php

namespace App\Service;

use App\Entity\RefreshToken;
use App\Entity\User;
use App\Repository\RefreshTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class RefreshTokenService
{
    private const MAX_TOKENS_PER_USER = 5;

    public function __construct(
        private EntityManagerInterface $entityManager,
        private RefreshTokenRepository $refreshTokenRepository,
        private JWTTokenManagerInterface $jwtManager
    ) {
    }

    public function createRefreshToken(User $user): RefreshToken
    {
        // Cleanup old tokens if user has too many
        $activeTokensCount = $this->refreshTokenRepository->countActiveTokensForUser($user);
        if ($activeTokensCount >= self::MAX_TOKENS_PER_USER) {
            $this->cleanupOldestTokensForUser($user, self::MAX_TOKENS_PER_USER - 1);
        }

        $refreshToken = new RefreshToken();
        $refreshToken->setUser($user);

        $this->refreshTokenRepository->save($refreshToken, true);

        return $refreshToken;
    }

    public function refreshAccessToken(string $refreshTokenString): array
    {
        $refreshToken = $this->refreshTokenRepository->findValidTokenByToken($refreshTokenString);

        if (!$refreshToken) {
            throw new \InvalidArgumentException('Invalid or expired refresh token');
        }

        if (!$refreshToken->isValid()) {
            throw new \InvalidArgumentException('Refresh token is not valid');
        }

        $user = $refreshToken->getUser();
        
        // Mark the refresh token as used
        $refreshToken->markAsUsed();
        
        // Generate new tokens
        $newAccessToken = $this->jwtManager->create($user);
        $newRefreshToken = $this->createRefreshToken($user);

        // Revoke the old refresh token
        $refreshToken->revoke();
        $this->entityManager->flush();

        return [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken->getToken(),
            'expires_in' => 3600, // 1 hour
            'token_type' => 'Bearer'
        ];
    }

    public function revokeRefreshToken(string $refreshTokenString): void
    {
        $refreshToken = $this->refreshTokenRepository->findValidTokenByToken($refreshTokenString);

        if ($refreshToken) {
            $refreshToken->revoke();
            $this->entityManager->flush();
        }
    }

    public function revokeAllUserTokens(User $user): void
    {
        $this->refreshTokenRepository->revokeAllUserTokens($user);
        $this->entityManager->flush();
    }

    private function cleanupOldestTokensForUser(User $user, int $keepCount): void
    {
        $tokens = $this->entityManager->createQueryBuilder()
            ->select('rt')
            ->from(RefreshToken::class, 'rt')
            ->where('rt.user = :user')
            ->andWhere('rt.isRevoked = false')
            ->andWhere('rt.expiresAt > :now')
            ->orderBy('rt.createdAt', 'ASC')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getResult();

        $tokensToRevoke = array_slice($tokens, 0, count($tokens) - $keepCount);

        foreach ($tokensToRevoke as $token) {
            $token->revoke();
        }

        $this->entityManager->flush();
    }

    public function cleanupExpiredTokens(): int
    {
        return $this->refreshTokenRepository->cleanupExpiredTokens();
    }
}
