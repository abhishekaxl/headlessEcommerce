# Headless eCommerce Portal

Production-grade headless eCommerce portal built with Next.js (App Router), TypeScript, and Magento 2.

## 🚀 Quick Start (Fully Automated)

```bash
# Clone and start everything
git clone https://github.com/abhishekaxl/headlessEcommerce.git
cd headlessEcommerce/docker
docker compose up -d
```

**That's it!** Magento 2.4.7 with sample data installs automatically on first run (~15-20 minutes).

Check progress:
```bash
docker logs -f headless-magento
```

### Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Magento Frontend** | http://localhost:8080 | - |
| **Magento Admin** | http://localhost:8080/admin | admin / Admin@123 |
| **phpMyAdmin** | http://localhost:8081 | root / rootpassword |
| **Mailhog** | http://localhost:8025 | - |

### Start Next.js Frontend

```bash
cd ..
npm install
npm run dev
# Access: http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Headless eCommerce                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │              Next.js Frontend (:3000)             │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │              Magento 2 Backend (:8080)            │   │
│  │         (GraphQL API, MySQL, Redis)               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
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
# Start services
cd docker && docker compose up -d

# View installation progress
docker logs -f headless-magento

# Stop services
docker compose down

# Fresh restart (deletes all data)
docker compose down -v && docker compose up -d

# Access Magento CLI
docker exec headless-magento bin/magento [command]
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend | Magento 2.4.7, GraphQL |
| Database | MySQL 8.0 |
| Search | Elasticsearch 7.17 |
| Cache | Redis 7 |

## License

MIT
