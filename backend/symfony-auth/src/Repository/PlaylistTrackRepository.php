<?php

namespace App\Repository;

use App\Entity\PlaylistTrack;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PlaylistTrack>
 */
class PlaylistTrackRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PlaylistTrack::class);
    }

    /**
     * Find tracks in playlist ordered by position
     */
    public function findByPlaylistOrdered($playlistId): array
    {
        return $this->createQueryBuilder('pt')
            ->andWhere('pt.playlist = :playlistId')
            ->setParameter('playlistId', $playlistId)
            ->orderBy('pt.position', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Get next position for a playlist
     */
    public function getNextPosition($playlistId): int
    {
        $result = $this->createQueryBuilder('pt')
            ->select('MAX(pt.position)')
            ->andWhere('pt.playlist = :playlistId')
            ->setParameter('playlistId', $playlistId)
            ->getQuery()
            ->getSingleScalarResult();

        return ($result ?? 0) + 1;
    }
}
