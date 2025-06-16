<?php

namespace App\Repository;

use App\Entity\Track;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Track>
 */
class TrackRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Track::class);
    }

    /**
     * Find tracks by user
     */
    public function findByUser(int $userId): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('t.uploadDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find public tracks
     */
    public function findPublicTracks(): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.isPublic = :isPublic')
            ->setParameter('isPublic', true)
            ->orderBy('t.uploadDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find tracks by file type
     */
    public function findByFileType(string $fileType): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.fileType = :fileType')
            ->setParameter('fileType', $fileType)
            ->getQuery()
            ->getResult();
    }
}
