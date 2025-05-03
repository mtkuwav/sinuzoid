FROM php:8.2-fpm

# Installer les extensions PHP nécessaires et appliquer les mises à jour de sécurité
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo pdo_pgsql

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copier l'application
COPY . .

# Installer les dépendances
RUN composer install --no-interaction --optimize-autoloader

# Exposer le port
EXPOSE 9000

CMD ["php-fpm"]