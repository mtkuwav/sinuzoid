<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\PlaylistRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PlaylistRepository::class)]
#[ORM\Table(name: 'playlists')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['playlist:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['playlist:read', 'playlist:detail']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Post(
            normalizationContext: ['groups' => ['playlist:read']],
            denormalizationContext: ['groups' => ['playlist:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            normalizationContext: ['groups' => ['playlist:read']],
            denormalizationContext: ['groups' => ['playlist:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Patch(
            normalizationContext: ['groups' => ['playlist:read']],
            denormalizationContext: ['groups' => ['playlist:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ],
    normalizationContext: ['groups' => ['playlist:read']],
    denormalizationContext: ['groups' => ['playlist:write']]
)]
class Playlist
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[Groups(['playlist:read'])]
    private ?Uuid $id = null;

    #[ORM\ManyToOne(inversedBy: 'playlists')]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['playlist:read', 'playlist:write'])]
    #[Assert\NotNull]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    #[Groups(['playlist:read', 'playlist:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['playlist:read', 'playlist:write'])]
    private ?string $description = null;

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['playlist:read', 'playlist:detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['playlist:read', 'playlist:detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToMany(mappedBy: 'playlist', targetEntity: PlaylistTrack::class, orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    #[Groups(['playlist:detail'])]
    private Collection $playlistTracks;

    public function __construct()
    {
        $this->playlistTracks = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
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
            $playlistTrack->setPlaylist($this);
        }
        return $this;
    }

    public function removePlaylistTrack(PlaylistTrack $playlistTrack): static
    {
        if ($this->playlistTracks->removeElement($playlistTrack)) {
            if ($playlistTrack->getPlaylist() === $this) {
                $playlistTrack->setPlaylist(null);
            }
        }
        return $this;
    }

    #[ORM\PreUpdate]
    public function updateTimestamp(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
