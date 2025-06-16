<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\PlaylistTrackRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PlaylistTrackRepository::class)]
#[ORM\Table(name: 'playlist_tracks')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['playlist_track:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['playlist_track:read', 'playlist_track:detail']],
            security: "is_granted('ROLE_ADMIN') or object.getPlaylist().getUser() == user"
        ),
        new Post(
            normalizationContext: ['groups' => ['playlist_track:read']],
            denormalizationContext: ['groups' => ['playlist_track:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            normalizationContext: ['groups' => ['playlist_track:read']],
            denormalizationContext: ['groups' => ['playlist_track:write']],
            security: "is_granted('ROLE_ADMIN') or object.getPlaylist().getUser() == user"
        ),
        new Patch(
            normalizationContext: ['groups' => ['playlist_track:read']],
            denormalizationContext: ['groups' => ['playlist_track:write']],
            security: "is_granted('ROLE_ADMIN') or object.getPlaylist().getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getPlaylist().getUser() == user"
        )
    ],
    normalizationContext: ['groups' => ['playlist_track:read']],
    denormalizationContext: ['groups' => ['playlist_track:write']]
)]
class PlaylistTrack
{
    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'playlistTracks')]
    #[ORM\JoinColumn(name: 'playlist_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['playlist_track:read', 'playlist_track:write'])]
    #[Assert\NotNull]
    private ?Playlist $playlist = null;

    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'playlistTracks')]
    #[ORM\JoinColumn(name: 'track_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['playlist_track:read', 'playlist_track:write', 'playlist:detail'])]
    #[Assert\NotNull]
    private ?Track $track = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['playlist_track:read', 'playlist_track:write', 'playlist:detail'])]
    #[Assert\PositiveOrZero]
    private ?int $position = null;

    #[ORM\Column(name: 'added_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['playlist_track:read', 'playlist_track:detail'])]
    private ?\DateTimeImmutable $addedAt = null;

    public function __construct()
    {
        $this->addedAt = new \DateTimeImmutable();
    }

    public function getPlaylist(): ?Playlist
    {
        return $this->playlist;
    }

    public function setPlaylist(?Playlist $playlist): static
    {
        $this->playlist = $playlist;
        return $this;
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

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(?int $position): static
    {
        $this->position = $position;
        return $this;
    }

    public function getAddedAt(): ?\DateTimeImmutable
    {
        return $this->addedAt;
    }

    public function setAddedAt(\DateTimeImmutable $addedAt): static
    {
        $this->addedAt = $addedAt;
        return $this;
    }
}
