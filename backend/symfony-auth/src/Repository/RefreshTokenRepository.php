<?php

namespace App\Repository;

use App\Entity\RefreshToken;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RefreshToken>
 */
class RefreshTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    public function findValidTokenByToken(string $token): ?RefreshToken
    {
        return $this->createQueryBuilder('rt')
            ->andWhere('rt.token = :token')
            ->andWhere('rt.isRevoked = false')
            ->andWhere('rt.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function revokeAllUserTokens(User $user): void
    {
        $this->createQueryBuilder('rt')
            ->update()
            ->set('rt.isRevoked', true)
            ->andWhere('rt.user = :user')
            ->andWhere('rt.isRevoked = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    public function cleanupExpiredTokens(): int
    {
        return $this->createQueryBuilder('rt')
            ->delete()
            ->andWhere('rt.expiresAt < :now')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }

    public function countActiveTokensForUser(User $user): int
    {
        return $this->createQueryBuilder('rt')
            ->select('COUNT(rt.id)')
            ->andWhere('rt.user = :user')
            ->andWhere('rt.isRevoked = false')
            ->andWhere('rt.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function save(RefreshToken $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(RefreshToken $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
