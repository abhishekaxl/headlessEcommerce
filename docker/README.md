# Docker Deployment Guide

This guide helps you deploy the complete Headless eCommerce stack using Docker.

## Prerequisites

- Docker Desktop installed
- Docker Compose v2+
- At least 8GB RAM allocated to Docker
- 20GB free disk space

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/abhishekaxl/headlessEcommerce.git
cd headlessEcommerce
```

### 2. Start All Services

```bash
cd docker
docker-compose up -d
```

This will start:
- **Magento 2** (Backend) - http://localhost:8080
- **Next.js** (Frontend) - http://localhost:3000
- **MySQL** - localhost:3306
- **Elasticsearch** - localhost:9200
- **Redis** - localhost:6379
- **Mailhog** (Email testing) - http://localhost:8025

### 3. Wait for Magento Installation

First-time setup takes 10-15 minutes. Check progress:

```bash
docker-compose logs -f magento
```

Wait until you see "Magento installation finished successfully".

### 4. Access the Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| Magento Admin | http://localhost:8080/admin | admin / Admin@123 |
| Magento Frontend | http://localhost:8080 | - |
| Next.js Storefront | http://localhost:3000 | - |
| Mailhog | http://localhost:8025 | - |

## Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Magento
MAGENTO_URL=http://localhost:8080
MAGENTO_ADMIN_USER=admin
MAGENTO_ADMIN_PASSWORD=Admin@123

# Next.js
NEXT_PUBLIC_MAGENTO_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Enable GraphQL in Magento

After Magento is running:

```bash
docker exec -it headless-magento bash
cd /bitnami/magento

# Enable required modules
bin/magento module:enable Magento_GraphQl Magento_CatalogGraphQl Magento_CustomerGraphQl
bin/magento setup:upgrade
bin/magento cache:flush
```

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f [service_name]
```

### Restart a Service
```bash
docker-compose restart magento
```

### Access Magento CLI
```bash
docker exec -it headless-magento bin/magento [command]
```

### Rebuild Frontend
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Sample Data

To install Magento sample data:

```bash
docker exec -it headless-magento bash
cd /bitnami/magento
bin/magento sampledata:deploy
bin/magento setup:upgrade
bin/magento indexer:reindex
bin/magento cache:flush
```

## Troubleshooting

### Elasticsearch Memory Error
Increase Docker memory to at least 4GB, or add to docker-compose.yml:
```yaml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms256m -Xmx256m"
```

### Magento 503 Error
Wait for installation to complete, or check logs:
```bash
docker-compose logs magento
```

### Database Connection Error
Ensure MySQL is running:
```bash
docker-compose ps mysql
```

### Clear All Data (Fresh Start)
```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

For production, update:

1. Use proper SSL certificates
2. Change all default passwords
3. Set `MAGENTO_MODE=production`
4. Configure proper email server
5. Set up CDN for static assets
6. Enable Varnish cache

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │   Next.js    │────▶│   Magento    │                  │
│  │   :3000      │     │   :8080      │                  │
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

## Support

For issues, create a GitHub issue at:
https://github.com/abhishekaxl/headlessEcommerce/issues

