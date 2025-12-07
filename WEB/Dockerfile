# Use Apache + PHP 8.2
FROM php:8.2-apache

# Enable required extensions
RUN docker-php-ext-install curl

# Copy project files to Apache web root
COPY . /var/www/html/

# Enable mod_rewrite (optional)
RUN a2enmod rewrite
