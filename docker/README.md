# Docker Deployment Guide

Complete Docker setup for Headless eCommerce with Magento 2.4.7.

## Prerequisites

- Docker Desktop installed
- Docker Compose v2+
- At least 8GB RAM allocated to Docker
- 20GB free disk space

## Quick Start

### 1. Start Services

```bash
cd docker
docker compose up -d
```

This starts:
- **MySQL** - localhost:3306
- **Elasticsearch** - localhost:9200
- **Redis** - localhost:6379
- **PHP-FPM (Magento)** - Internal
- **Nginx** - localhost:8080
- **phpMyAdmin** - localhost:8081
- **Mailhog** - localhost:8025

### 2. Install Magento (First Time Only)

Wait for MySQL to be healthy:
```bash
docker ps  # Check STATUS shows "healthy" for headless-mysql
```

Install Magento:
```bash
docker exec headless-magento bash -c "cd /var/www/html && \
  composer config --no-interaction audit.block-insecure false && \
  COMPOSER_AUTH='{\"http-basic\":{\"repo.magento.com\":{\"username\":\"903a085d52adb99acec8bc43ce31be08\",\"password\":\"e01cc3e6d30310552a150996fc98032f\"}}}' \
  composer install --no-interaction"
```

Run Magento setup:
```bash
docker exec headless-magento bash -c "cd /var/www/html && \
  bin/magento setup:install \
    --base-url=http://localhost:8080 \
    --db-host=mysql \
    --db-name=magento \
    --db-user=magento \
    --db-password=magento \
    --admin-firstname=Admin \
    --admin-lastname=User \
    --admin-email=admin@example.com \
    --admin-user=admin \
    --admin-password=Admin@123 \
    --language=en_US \
    --currency=USD \
    --timezone=America/New_York \
    --use-rewrites=1 \
    --search-engine=elasticsearch7 \
    --elasticsearch-host=elasticsearch \
    --elasticsearch-port=9200 \
    --backend-frontname=admin"
```

Disable 2FA and set permissions:
```bash
docker exec headless-magento bash -c "cd /var/www/html && \
  bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth && \
  bin/magento setup:upgrade && \
  bin/magento cache:flush && \
  chown -R www-data:www-data ."
```

### 3. Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Magento Frontend | http://localhost:8080 | - |
| Magento Admin | http://localhost:8080/admin | admin / Admin@123 |
| phpMyAdmin | http://localhost:8081 | root / rootpassword |
| Mailhog | http://localhost:8025 | - |

## Adobe Credentials

Adobe Commerce Marketplace credentials are stored in `docker/auth.json`:
- **Public Key**: 903a085d52adb99acec8bc43ce31be08
- **Private Key**: e01cc3e6d30310552a150996fc98032f

These are used to download Magento packages from repo.magento.com.

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f [service_name]

# Restart a service
docker compose restart magento

# Access Magento CLI
docker exec headless-magento bin/magento [command]

# Clear all data (fresh start)
docker compose down -v
docker compose up -d
```

## Sample Data (Optional)

To install Magento sample data:
```bash
docker exec headless-magento bash -c "cd /var/www/html && \
  bin/magento sampledata:deploy && \
  bin/magento setup:upgrade && \
  bin/magento indexer:reindex && \
  bin/magento cache:flush"
```

## Troubleshooting

### Elasticsearch Memory Error
Increase Docker memory to at least 4GB.

### Magento 503 Error
Wait for installation to complete or check logs:
```bash
docker logs headless-magento
```

### Database Connection Error
Ensure MySQL is healthy:
```bash
docker ps | grep mysql
```

### Permission Issues
```bash
docker exec headless-magento chown -R www-data:www-data /var/www/html
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │    Nginx     │────▶│   PHP-FPM    │                  │
│  │    :8080     │     │   (Magento)  │                  │
│  └──────────────┘     └──────┬───────┘                  │
│                              │                           │
│         ┌────────────────────┼────────────────────┐     │
│         │                    │                    │     │
│         ▼                    ▼                    ▼     │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────┐│
│  │    MySQL     │     │Elasticsearch │     │  Redis   ││
│  │    :3306     │     │    :9200     │     │  :6379   ││
│  └──────────────┘     └──────────────┘     └──────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```
