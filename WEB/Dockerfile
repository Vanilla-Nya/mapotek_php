FROM php:8.2-apache

# cURL is already included in PHP 8.2 base image — no need to install

# Enable rewrite (optional)
RUN a2enmod rewrite

# Copy app files
COPY . /var/www/html/
