<?php

namespace App\Repository;

use App\Entity\StandardMetadata;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<StandardMetadata>
 */
class StandardMetadataRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StandardMetadata::class);
    }

    /**
     * Search metadata by title, artist, or album
     */
    public function searchByText(string $searchTerm): array
    {
        return $this->createQueryBuilder('sm')
            ->where('sm.title LIKE :searchTerm OR sm.artist LIKE :searchTerm OR sm.album LIKE :searchTerm')
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find by artist
     */
    public function findByArtist(string $artist): array
    {
        return $this->createQueryBuilder('sm')
            ->andWhere('sm.artist = :artist')
            ->setParameter('artist', $artist)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find by genre
     */
    public function findByGenre(string $genre): array
    {
        return $this->createQueryBuilder('sm')
            ->andWhere('sm.genre = :genre')
            ->setParameter('genre', $genre)
            ->getQuery()
            ->getResult();
    }
}
