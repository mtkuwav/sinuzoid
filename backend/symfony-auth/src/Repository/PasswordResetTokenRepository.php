<?php

namespace App\Repository;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PasswordResetToken>
 */
class PasswordResetTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PasswordResetToken::class);
    }

    public function findValidTokenByToken(string $token): ?PasswordResetToken
    {
        return $this->createQueryBuilder('prt')
            ->andWhere('prt.token = :token')
            ->andWhere('prt.isUsed = false')
            ->andWhere('prt.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function invalidateAllUserTokens(User $user): void
    {
        $this->createQueryBuilder('prt')
            ->update()
            ->set('prt.isUsed', ':true')
            ->andWhere('prt.user = :user')
            ->andWhere('prt.isUsed = false')
            ->setParameter('user', $user)
            ->setParameter('true', true)
            ->getQuery()
            ->execute();
    }

    public function cleanupExpiredTokens(): int
    {
        return $this->createQueryBuilder('prt')
            ->delete()
            ->andWhere('prt.expiresAt < :now')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }

    public function save(PasswordResetToken $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(PasswordResetToken $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
