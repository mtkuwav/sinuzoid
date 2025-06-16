<?php

namespace App\Repository;

use App\Entity\ExtendedMetadata;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ExtendedMetadata>
 */
class ExtendedMetadataRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ExtendedMetadata::class);
    }

    /**
     * Search in JSONB metadata
     */
    public function searchInMetadata(string $key, $value): array
    {
        return $this->createQueryBuilder('em')
            ->where('JSON_EXTRACT(em.metadata, :key) = :value')
            ->setParameter('key', '$.' . $key)
            ->setParameter('value', $value)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find metadata containing specific key
     */
    public function findByMetadataKey(string $key): array
    {
        return $this->createQueryBuilder('em')
            ->where('JSON_EXTRACT(em.metadata, :key) IS NOT NULL')
            ->setParameter('key', '$.' . $key)
            ->getQuery()
            ->getResult();
    }
}
