FROM php:8.2-fpm

# Installer les extensions PHP et Nginx
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    nginx \
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
RUN composer install --no-interaction --optimize-autoloader || echo "Aucune dépendance à installer"

# S'assurer que le dossier public existe
RUN mkdir -p /var/www/public

# Fichier de test simple pour vérifier que ça fonctionne
# RUN echo '<?php echo "Symfony AUTH service running!"; ?>' > /var/www/public/index.php

# Configuration Nginx pour Symfony - NOTEZ LE PORT 80 AU LIEU DE 9000
RUN echo 'server {\n\
    listen 80 default_server;\n\
    server_name _;\n\
    root /var/www/public;\n\
    index index.php;\n\
    \n\
    location / {\n\
        try_files $uri /index.php$is_args$args;\n\
    }\n\
    \n\
    location ~ ^/index\.php(/|$) {\n\
        fastcgi_pass 127.0.0.1:9000;\n\
        fastcgi_split_path_info ^(.+\.php)(/.*)$;\n\
        include fastcgi_params;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
        internal;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Désactiver la configuration par défaut
RUN rm -f /etc/nginx/sites-enabled/default

# Script de démarrage
RUN echo '#!/bin/bash\nset -e\nphp-fpm -D\nnginx -g "daemon off;"' > /usr/local/bin/start.sh \
    && chmod +x /usr/local/bin/start.sh

# Exposer le port pour Nginx
EXPOSE 80

CMD ["/usr/local/bin/start.sh"]