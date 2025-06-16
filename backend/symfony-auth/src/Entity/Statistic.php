<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use App\Repository\StatisticRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: StatisticRepository::class)]
#[ORM\Table(name: 'statistics')]
#[ORM\Index(name: 'idx_statistics_user_id', columns: ['user_id'])]
#[ORM\Index(name: 'idx_statistics_track_id', columns: ['track_id'])]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['statistic:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['statistic:read', 'statistic:detail']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Post(
            normalizationContext: ['groups' => ['statistic:read']],
            denormalizationContext: ['groups' => ['statistic:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            normalizationContext: ['groups' => ['statistic:read']],
            denormalizationContext: ['groups' => ['statistic:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Patch(
            normalizationContext: ['groups' => ['statistic:read']],
            denormalizationContext: ['groups' => ['statistic:write']],
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ],
    normalizationContext: ['groups' => ['statistic:read']],
    denormalizationContext: ['groups' => ['statistic:write']]
)]
class Statistic
{
    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'statistics')]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['statistic:read', 'statistic:write'])]
    #[Assert\NotNull]
    private ?User $user = null;

    #[ORM\Id]
    #[ORM\ManyToOne(inversedBy: 'statistics')]
    #[ORM\JoinColumn(name: 'track_id', nullable: true, onDelete: 'CASCADE')]
    #[Groups(['statistic:read', 'statistic:write'])]
    private ?Track $track = null;

    #[ORM\Column(name: 'play_count', options: ['default' => 0])]
    #[Groups(['statistic:read', 'statistic:write'])]
    #[Assert\PositiveOrZero]
    private int $playCount = 0;

    #[ORM\Column(name: 'last_played', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['statistic:read', 'statistic:write'])]
    private ?\DateTimeImmutable $lastPlayed = null;

    #[ORM\Column(name: 'user_rating', type: Types::SMALLINT, nullable: true)]
    #[Groups(['statistic:read', 'statistic:write'])]
    #[Assert\Range(min: 1, max: 5)]
    private ?int $userRating = null;

    #[ORM\Column(name: 'total_listen_time', type: Types::DATEINTERVAL, options: ['default' => '0 seconds'])]
    #[Groups(['statistic:read', 'statistic:write', 'statistic:detail'])]
    private ?\DateInterval $totalListenTime = null;

    #[ORM\Column(name: 'skip_count', options: ['default' => 0])]
    #[Groups(['statistic:read', 'statistic:write'])]
    #[Assert\PositiveOrZero]
    private int $skipCount = 0;

    #[ORM\Column(name: 'complete_plays', options: ['default' => 0])]
    #[Groups(['statistic:read', 'statistic:write'])]
    #[Assert\PositiveOrZero]
    private int $completePlays = 0;

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['statistic:detail'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['statistic:detail'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->totalListenTime = new \DateInterval('PT0S'); // 0 seconds
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
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

    public function getTrack(): ?Track
    {
        return $this->track;
    }

    public function setTrack(?Track $track): static
    {
        $this->track = $track;
        return $this;
    }

    public function getPlayCount(): int
    {
        return $this->playCount;
    }

    public function setPlayCount(int $playCount): static
    {
        $this->playCount = $playCount;
        return $this;
    }

    public function incrementPlayCount(): static
    {
        $this->playCount++;
        return $this;
    }

    public function getLastPlayed(): ?\DateTimeImmutable
    {
        return $this->lastPlayed;
    }

    public function setLastPlayed(?\DateTimeImmutable $lastPlayed): static
    {
        $this->lastPlayed = $lastPlayed;
        return $this;
    }

    public function getUserRating(): ?int
    {
        return $this->userRating;
    }

    public function setUserRating(?int $userRating): static
    {
        if ($userRating !== null && ($userRating < 1 || $userRating > 5)) {
            throw new \InvalidArgumentException('User rating must be between 1 and 5');
        }
        $this->userRating = $userRating;
        return $this;
    }

    public function getTotalListenTime(): ?\DateInterval
    {
        return $this->totalListenTime;
    }

    public function setTotalListenTime(\DateInterval $totalListenTime): static
    {
        $this->totalListenTime = $totalListenTime;
        return $this;
    }

    public function addListenTime(\DateInterval $duration): static
    {
        // Convert both intervals to seconds for addition
        $currentSeconds = $this->dateIntervalToSeconds($this->totalListenTime);
        $addSeconds = $this->dateIntervalToSeconds($duration);
        
        $totalSeconds = $currentSeconds + $addSeconds;
        $this->totalListenTime = $this->secondsToDateInterval($totalSeconds);
        
        return $this;
    }

    public function getSkipCount(): int
    {
        return $this->skipCount;
    }

    public function setSkipCount(int $skipCount): static
    {
        $this->skipCount = $skipCount;
        return $this;
    }

    public function incrementSkipCount(): static
    {
        $this->skipCount++;
        return $this;
    }

    public function getCompletePlays(): int
    {
        return $this->completePlays;
    }

    public function setCompletePlays(int $completePlays): static
    {
        $this->completePlays = $completePlays;
        return $this;
    }

    public function incrementCompletePlays(): static
    {
        $this->completePlays++;
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

    private function dateIntervalToSeconds(\DateInterval $interval): int
    {
        return $interval->s + $interval->i * 60 + $interval->h * 3600 + $interval->d * 86400;
    }

    private function secondsToDateInterval(int $seconds): \DateInterval
    {
        return new \DateInterval('PT' . $seconds . 'S');
    }
}
