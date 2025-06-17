<?php

namespace App\Repository;

use App\Entity\Statistic;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Statistic>
 */
class StatisticRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Statistic::class);
    }

    /**
     * Find statistics for a user
     */
    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find most played tracks for a user
     */
    public function findMostPlayedByUser(int $userId, int $limit = 10): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('s.playCount', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recently played tracks for a user
     */
    public function findRecentlyPlayedByUser(int $userId, int $limit = 10): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.user = :userId')
            ->andWhere('s.lastPlayed IS NOT NULL')
            ->setParameter('userId', $userId)
            ->orderBy('s.lastPlayed', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find highest rated tracks for a user
     */
    public function findHighestRatedByUser(int $userId, int $limit = 10): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.user = :userId')
            ->andWhere('s.userRating IS NOT NULL')
            ->setParameter('userId', $userId)
            ->orderBy('s.userRating', 'DESC')
            ->addOrderBy('s.playCount', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get user statistics summary
     */
    public function getUserStatisticsSummary(int $userId): array
    {
        return $this->createQueryBuilder('s')
            ->select('
                COUNT(s.track) as totalTracks,
                SUM(s.playCount) as totalPlays,
                SUM(s.completePlays) as totalCompletePlays,
                SUM(s.skipCount) as totalSkips,
                AVG(s.userRating) as averageRating
            ')
            ->andWhere('s.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getSingleResult();
    }
}
