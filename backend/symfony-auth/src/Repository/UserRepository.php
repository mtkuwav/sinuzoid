<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Find user by username or email
     */
    public function findByUsernameOrEmail(string $identifier): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.username = :identifier OR u.email = :identifier')
            ->setParameter('identifier', $identifier)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.email = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find user by username
     */
    public function findByUsername(string $username): ?User
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.username = :username')
            ->setParameter('username', $username)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Check if username exists
     */
    public function usernameExists(string $username): bool
    {
        return $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->andWhere('u.username = :username')
            ->setParameter('username', $username)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    /**
     * Check if email exists
     */
    public function emailExists(string $email): bool
    {
        return $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->andWhere('u.email = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    /**
     * Find users by role
     */
    public function findByRole(string $role): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.role = :role')
            ->setParameter('role', $role)
            ->orderBy('u.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all admin users
     */
    public function findAdmins(): array
    {
        return $this->findByRole('admin');
    }

    /**
     * Find users created between dates
     */
    public function findCreatedBetween(\DateTimeInterface $start, \DateTimeInterface $end): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.createdAt BETWEEN :start AND :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('u.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find users with recent activity (last login within X days)
     */
    public function findActiveUsers(int $days = 30): array
    {
        $cutoffDate = new \DateTimeImmutable('-' . $days . ' days');
        
        return $this->createQueryBuilder('u')
            ->andWhere('u.lastLogin >= :cutoff')
            ->setParameter('cutoff', $cutoffDate)
            ->orderBy('u.lastLogin', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find users who never logged in
     */
    public function findNeverLoggedIn(): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.lastLogin IS NULL')
            ->orderBy('u.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Update last login time for user
     */
    public function updateLastLogin(User $user): void
    {
        $user->setLastLogin(new \DateTimeImmutable());
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Get total storage used by user (sum of all track file sizes)
     */
    public function getTotalStorageUsed(User $user): int
    {
        $result = $this->createQueryBuilder('u')
            ->select('SUM(t.fileSize)')
            ->leftJoin('u.tracks', 't')
            ->andWhere('u.id = :userId')
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getSingleScalarResult();

        return (int) ($result ?? 0);
    }

    /**
     * Get user statistics (tracks count, playlists count, etc.)
     */
    public function getUserStats(User $user): array
    {
        $qb = $this->createQueryBuilder('u')
            ->select([
                'COUNT(DISTINCT t.id) as tracksCount',
                'COUNT(DISTINCT p.id) as playlistsCount',
                'COUNT(DISTINCT s.id) as statisticsCount',
                'SUM(t.fileSize) as totalStorageUsed'
            ])
            ->leftJoin('u.tracks', 't')
            ->leftJoin('u.playlists', 'p')
            ->leftJoin('u.statistics', 's')
            ->andWhere('u.id = :userId')
            ->setParameter('userId', $user->getId())
            ->groupBy('u.id');

        $result = $qb->getQuery()->getOneOrNullResult();

        return [
            'tracksCount' => (int) ($result['tracksCount'] ?? 0),
            'playlistsCount' => (int) ($result['playlistsCount'] ?? 0),
            'statisticsCount' => (int) ($result['statisticsCount'] ?? 0),
            'totalStorageUsed' => (int) ($result['totalStorageUsed'] ?? 0),
            'storageQuota' => $user->getStorageQuota(),
            'storageUsagePercent' => $user->getStorageQuota() > 0 ? 
                round(((int) ($result['totalStorageUsed'] ?? 0) / $user->getStorageQuota()) * 100, 2) : 0
        ];
    }

    /**
     * Find users exceeding their storage quota
     */
    public function findUsersExceedingQuota(): array
    {
        return $this->createQueryBuilder('u')
            ->select('u')
            ->leftJoin('u.tracks', 't')
            ->groupBy('u.id')
            ->having('SUM(t.fileSize) > u.storageQuota')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search users by username or email (for admin panel)
     */
    public function searchUsers(string $searchTerm, int $limit = 20): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.username LIKE :search OR u.email LIKE :search')
            ->setParameter('search', '%' . $searchTerm . '%')
            ->orderBy('u.username', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get paginated users list
     */
    public function findPaginated(int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Count total users
     */
    public function countUsers(): int
    {
        return $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
