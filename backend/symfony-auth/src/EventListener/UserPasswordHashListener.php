<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsEntityListener(event: Events::prePersist, entity: User::class)]
#[AsEntityListener(event: Events::preUpdate, entity: User::class)]
class UserPasswordHashListener
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function prePersist(User $user, LifecycleEventArgs $event): void
    {
        $this->encodePassword($user);
    }

    public function preUpdate(User $user, LifecycleEventArgs $event): void
    {
        $this->encodePassword($user);
    }

    /**
     * Encode password based on the UserInterface implementation
     */
    private function encodePassword(User $user): void
    {
        if ($user->getPassword()) {
            // Check if password is already hashed (to avoid double hashing)
            if (!password_get_info($user->getPassword())['algo']) {
                $encoded = $this->passwordHasher->hashPassword($user, $user->getPassword());
                $user->setPassword($encoded);
            }
        }
    }
}
