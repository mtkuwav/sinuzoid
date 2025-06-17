<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\ExtendedMetadataRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ExtendedMetadataRepository::class)]
#[ORM\Table(name: 'extended_metadata')]
#[ORM\Index(name: 'idx_metadata_gin', columns: ['metadata'], options: ['using' => 'gin', 'type' => 'jsonb_path_ops'])]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['extended_metadata:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['extended_metadata:read', 'extended_metadata:detail']],
            security: "is_granted('ROLE_USER') and (object.getTrack().isPublic() or object.getTrack().getUser() == user)"
        ),
        new Post(
            normalizationContext: ['groups' => ['extended_metadata:read']],
            denormalizationContext: ['groups' => ['extended_metadata:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            normalizationContext: ['groups' => ['extended_metadata:read']],
            denormalizationContext: ['groups' => ['extended_metadata:write']],
            security: "is_granted('ROLE_ADMIN') or object.getTrack().getUser() == user"
        ),
        new Patch(
            normalizationContext: ['groups' => ['extended_metadata:read']],
            denormalizationContext: ['groups' => ['extended_metadata:write']],
            security: "is_granted('ROLE_ADMIN') or object.getTrack().getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getTrack().getUser() == user"
        )
    ],
    normalizationContext: ['groups' => ['extended_metadata:read']],
    denormalizationContext: ['groups' => ['extended_metadata:write']]
)]
class ExtendedMetadata
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['extended_metadata:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'extendedMetadata')]
    #[ORM\JoinColumn(name: 'track_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['extended_metadata:read', 'extended_metadata:write'])]
    #[Assert\NotNull]
    private ?Track $track = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['extended_metadata:read', 'extended_metadata:write', 'track:detail'])]
    #[Assert\NotNull]
    private array $metadata = [];

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['extended_metadata:detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTrack(): ?Track
    {
        return $this->track;
    }

    public function setTrack(?Track $track): static
    {
        $this->track = $track;
        return $this;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function setMetadata(array $metadata): static
    {
        $this->metadata = $metadata;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}
