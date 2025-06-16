<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\TrackRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TrackRepository::class)]
#[ORM\Table(name: 'tracks')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['track:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['track:read', 'track:detail']],
            security: "is_granted('ROLE_USER') and (object.isPublic() or object.getUser() == user)"
        ),
        new Post(
            normalizationContext: ['groups' => ['track:read']],
            denormalizationContext: ['groups' => ['track:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            normalizationContext: ['groups' => ['track:read']],
            denormalizationContext: ['groups' => ['track:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Patch(
            normalizationContext: ['groups' => ['track:read']],
            denormalizationContext: ['groups' => ['track:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ],
    normalizationContext: ['groups' => ['track:read']],
    denormalizationContext: ['groups' => ['track:write']]
)]
class Track
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['track:read', 'playlist:read', 'statistic:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(inversedBy: 'tracks')]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['track:read', 'track:write'])]
    #[Assert\NotNull]
    private ?User $user = null;

    #[ORM\Column(name: 'original_filename', length: 255)]
    #[Groups(['track:read', 'track:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private ?string $originalFilename = null;

    #[ORM\Column(name: 'file_path', length: 512, unique: true)]
    #[Groups(['track:read', 'track:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 512)]
    private ?string $filePath = null;

    #[ORM\Column(name: 'file_size', type: Types::BIGINT)]
    #[Groups(['track:read', 'track:write', 'track:detail'])]
    #[Assert\NotNull]
    #[Assert\PositiveOrZero]
    private ?int $fileSize = null;

    #[ORM\Column(name: 'file_type', length: 10)]
    #[Groups(['track:read', 'track:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['mp3', 'wav', 'flac', 'ogg', 'aac'])]
    private ?string $fileType = null;

    #[ORM\Column(type: Types::DATEINTERVAL)]
    #[Groups(['track:read', 'track:write', 'track:detail'])]
    #[Assert\NotNull]
    private ?\DateInterval $duration = null;

    #[ORM\Column(name: 'upload_date', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['track:read', 'track:detail'])]
    private ?\DateTimeImmutable $uploadDate = null;

    #[ORM\Column(name: 'last_accessed', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['track:detail'])]
    private ?\DateTimeImmutable $lastAccessed = null;

    #[ORM\Column(name: 'is_public', options: ['default' => false])]
    #[Groups(['track:read', 'track:write'])]
    private bool $isPublic = false;

    #[ORM\OneToOne(mappedBy: 'track', targetEntity: StandardMetadata::class, cascade: ['persist', 'remove'])]
    #[Groups(['track:detail'])]
    private ?StandardMetadata $standardMetadata = null;

    #[ORM\OneToMany(mappedBy: 'track', targetEntity: ExtendedMetadata::class, orphanRemoval: true)]
    #[Groups(['track:detail'])]
    private Collection $extendedMetadata;

    #[ORM\OneToMany(mappedBy: 'track', targetEntity: PlaylistTrack::class, orphanRemoval: true)]
    private Collection $playlistTracks;

    #[ORM\OneToMany(mappedBy: 'track', targetEntity: Statistic::class, orphanRemoval: true)]
    private Collection $statistics;

    public function __construct()
    {
        $this->extendedMetadata = new ArrayCollection();
        $this->playlistTracks = new ArrayCollection();
        $this->statistics = new ArrayCollection();
        $this->uploadDate = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getOriginalFilename(): ?string
    {
        return $this->originalFilename;
    }

    public function setOriginalFilename(string $originalFilename): static
    {
        $this->originalFilename = $originalFilename;
        return $this;
    }

    public function getFilePath(): ?string
    {
        return $this->filePath;
    }

    public function setFilePath(string $filePath): static
    {
        $this->filePath = $filePath;
        return $this;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function setFileSize(int $fileSize): static
    {
        $this->fileSize = $fileSize;
        return $this;
    }

    public function getFileType(): ?string
    {
        return $this->fileType;
    }

    public function setFileType(string $fileType): static
    {
        $allowedTypes = ['mp3', 'wav', 'flac', 'ogg', 'aac'];
        if (!in_array($fileType, $allowedTypes)) {
            throw new \InvalidArgumentException('Invalid file type');
        }
        $this->fileType = $fileType;
        return $this;
    }

    public function getDuration(): ?\DateInterval
    {
        return $this->duration;
    }

    public function setDuration(\DateInterval $duration): static
    {
        $this->duration = $duration;
        return $this;
    }

    public function getUploadDate(): ?\DateTimeImmutable
    {
        return $this->uploadDate;
    }

    public function setUploadDate(\DateTimeImmutable $uploadDate): static
    {
        $this->uploadDate = $uploadDate;
        return $this;
    }

    public function getLastAccessed(): ?\DateTimeImmutable
    {
        return $this->lastAccessed;
    }

    public function setLastAccessed(?\DateTimeImmutable $lastAccessed): static
    {
        $this->lastAccessed = $lastAccessed;
        return $this;
    }

    public function isPublic(): bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;
        return $this;
    }

    public function getStandardMetadata(): ?StandardMetadata
    {
        return $this->standardMetadata;
    }

    public function setStandardMetadata(?StandardMetadata $standardMetadata): static
    {
        // Unset the owning side of the relation if necessary
        if ($standardMetadata === null && $this->standardMetadata !== null) {
            $this->standardMetadata->setTrack(null);
        }

        // Set the owning side of the relation if necessary
        if ($standardMetadata !== null && $standardMetadata->getTrack() !== $this) {
            $standardMetadata->setTrack($this);
        }

        $this->standardMetadata = $standardMetadata;
        return $this;
    }

    /**
     * @return Collection<int, ExtendedMetadata>
     */
    public function getExtendedMetadata(): Collection
    {
        return $this->extendedMetadata;
    }

    public function addExtendedMetadata(ExtendedMetadata $extendedMetadata): static
    {
        if (!$this->extendedMetadata->contains($extendedMetadata)) {
            $this->extendedMetadata->add($extendedMetadata);
            $extendedMetadata->setTrack($this);
        }
        return $this;
    }

    public function removeExtendedMetadata(ExtendedMetadata $extendedMetadata): static
    {
        if ($this->extendedMetadata->removeElement($extendedMetadata)) {
            if ($extendedMetadata->getTrack() === $this) {
                $extendedMetadata->setTrack(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, PlaylistTrack>
     */
    public function getPlaylistTracks(): Collection
    {
        return $this->playlistTracks;
    }

    public function addPlaylistTrack(PlaylistTrack $playlistTrack): static
    {
        if (!$this->playlistTracks->contains($playlistTrack)) {
            $this->playlistTracks->add($playlistTrack);
            $playlistTrack->setTrack($this);
        }
        return $this;
    }

    public function removePlaylistTrack(PlaylistTrack $playlistTrack): static
    {
        if ($this->playlistTracks->removeElement($playlistTrack)) {
            if ($playlistTrack->getTrack() === $this) {
                $playlistTrack->setTrack(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Statistic>
     */
    public function getStatistics(): Collection
    {
        return $this->statistics;
    }

    public function addStatistic(Statistic $statistic): static
    {
        if (!$this->statistics->contains($statistic)) {
            $this->statistics->add($statistic);
            $statistic->setTrack($this);
        }
        return $this;
    }

    public function removeStatistic(Statistic $statistic): static
    {
        if ($this->statistics->removeElement($statistic)) {
            if ($statistic->getTrack() === $this) {
                $statistic->setTrack(null);
            }
        }
        return $this;
    }
}
