FROM php:8.3-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Create a system user with UID and GID 1000
RUN groupadd -g 1000 laravel && \
    useradd -u 1000 -g laravel -m laravel

# Set correct ownership and permissions
RUN chown -R laravel:laravel /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 storage bootstrap/cache

USER laravel

RUN composer install --no-interaction --prefer-dist --optimize-autoloader
RUN cp .env.example .env || true
RUN php artisan key:generate

EXPOSE 9000

CMD ["php-fpm"]
