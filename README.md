# Headless eCommerce Portal

Production-grade headless eCommerce portal built with Next.js (App Router), TypeScript, and Magento 2.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed (8GB+ RAM allocated)
- 20GB free disk space

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/abhishekaxl/headlessEcommerce.git
cd headlessEcommerce

# 2. Start Docker services
cd docker
docker compose up -d

# 3. Wait for MySQL to be healthy (check with: docker ps)

# 4. Install Magento (first time only - takes ~10 minutes)
docker exec headless-magento bash -c "cd /var/www/html && \
  composer config --no-interaction audit.block-insecure false && \
  COMPOSER_AUTH='{\"http-basic\":{\"repo.magento.com\":{\"username\":\"903a085d52adb99acec8bc43ce31be08\",\"password\":\"e01cc3e6d30310552a150996fc98032f\"}}}' \
  composer install --no-interaction"

# 5. Run Magento setup
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

# 6. Disable 2FA for development
docker exec headless-magento bash -c "cd /var/www/html && \
  bin/magento module:disable Magento_AdminAdobeImsTwoFactorAuth Magento_TwoFactorAuth && \
  bin/magento setup:upgrade && \
  bin/magento cache:flush && \
  chown -R www-data:www-data ."

# 7. Start Next.js frontend
cd ..
npm install
npm run dev
```

### Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Next.js Storefront** | http://localhost:3000 | - |
| **Magento Frontend** | http://localhost:8080 | - |
| **Magento Admin** | http://localhost:8080/admin | admin / Admin@123 |
| **phpMyAdmin** | http://localhost:8081 | root / rootpassword |
| **Mailhog** | http://localhost:8025 | - |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Headless eCommerce                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Next.js Frontend                     │   │
│  │         (Atomic Design Pattern)                   │   │
│  │   atoms → molecules → organisms → templates       │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │         GraphQL Middleware Layer                  │   │
│  │    (Normalization, Caching, Error Handling)       │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │              Magento 2 Backend                    │   │
│  │         (GraphQL API, MySQL, Redis)               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
headlessEcommerce/
├── app/                    # Next.js App Router pages
├── components/             # React components (Atomic Design)
│   ├── atoms/              # Basic UI elements
│   ├── molecules/          # Combinations
│   ├── organisms/          # Complex sections
│   └── templates/          # Page layouts
├── lib/                    # Utilities and helpers
├── middleware/             # GraphQL Normalization Gateway
├── docker/                 # Docker deployment files
│   ├── docker-compose.yml  # Complete stack configuration
│   ├── Dockerfile.magento  # PHP-FPM container
│   ├── nginx.conf          # Nginx configuration
│   └── auth.json           # Adobe Marketplace credentials
└── docs/                   # Documentation
```

## Environment Variables

Create `.env.local` in project root:

```bash
MAGENTO_GRAPHQL_URL=http://localhost:8080/graphql
MAGENTO_STORE_CODE=default
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql
```

## Common Commands

```bash
# Start all Docker services
cd docker && docker compose up -d

# Stop all services
docker compose down

# View Magento logs
docker logs headless-magento

# Access Magento CLI
docker exec headless-magento bin/magento [command]

# Rebuild after changes
docker compose down -v && docker compose up -d

# Start Next.js dev server
npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | CSS Variables, Tailwind CSS |
| Backend | Magento 2.4.7, GraphQL |
| Database | MySQL 8.0 |
| Search | Elasticsearch 7.17 |
| Cache | Redis 7 |
| Container | Docker, Docker Compose |

## License

MIT

## Support

For issues, create a GitHub issue at:
https://github.com/abhishekaxl/headlessEcommerce/issues
