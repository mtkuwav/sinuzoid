<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\StandardMetadataRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: StandardMetadataRepository::class)]
#[ORM\Table(name: 'standard_metadata')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['metadata:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['metadata:read', 'metadata:detail']],
            security: "is_granted('ROLE_USER') and (object.getTrack().isPublic() or object.getTrack().getUser() == user)"
        ),
        new Post(
            normalizationContext: ['groups' => ['metadata:read']],
            denormalizationContext: ['groups' => ['metadata:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            normalizationContext: ['groups' => ['metadata:read']],
            denormalizationContext: ['groups' => ['metadata:write']],
            security: "is_granted('ROLE_ADMIN') or object.getTrack().getUser() == user"
        ),
        new Patch(
            normalizationContext: ['groups' => ['metadata:read']],
            denormalizationContext: ['groups' => ['metadata:write']],
            security: "is_granted('ROLE_ADMIN') or object.getTrack().getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getTrack().getUser() == user"
        )
    ],
    normalizationContext: ['groups' => ['metadata:read']],
    denormalizationContext: ['groups' => ['metadata:write']]
)]
class StandardMetadata
{
    #[ORM\OneToOne(inversedBy: 'standardMetadata', targetEntity: Track::class)]
    #[ORM\Id]
    #[ORM\JoinColumn(name: 'track_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['metadata:read', 'metadata:write'])]
    #[Assert\NotNull]
    private ?Track $track = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['metadata:read', 'metadata:write', 'track:read'])]
    #[Assert\Length(max: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['metadata:read', 'metadata:write', 'track:read'])]
    #[Assert\Length(max: 255)]
    private ?string $artist = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['metadata:read', 'metadata:write', 'track:read'])]
    #[Assert\Length(max: 255)]
    private ?string $album = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['metadata:read', 'metadata:write', 'track:read'])]
    #[Assert\Length(max: 100)]
    private ?string $genre = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['metadata:read', 'metadata:write', 'track:read'])]
    #[Assert\Range(min: 1900, max: 2100)]
    private ?int $year = null;

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['metadata:detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['metadata:detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getArtist(): ?string
    {
        return $this->artist;
    }

    public function setArtist(?string $artist): static
    {
        $this->artist = $artist;
        return $this;
    }

    public function getAlbum(): ?string
    {
        return $this->album;
    }

    public function setAlbum(?string $album): static
    {
        $this->album = $album;
        return $this;
    }

    public function getGenre(): ?string
    {
        return $this->genre;
    }

    public function setGenre(?string $genre): static
    {
        $this->genre = $genre;
        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(?int $year): static
    {
        $this->year = $year;
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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
