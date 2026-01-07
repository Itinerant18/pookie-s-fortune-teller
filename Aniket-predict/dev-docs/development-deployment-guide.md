# Development Setup & Deployment Guide

## Complete Guide to Building and Deploying the Hybrid Prediction App

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Project Structure](#project-structure)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [ML Pipeline Setup](#ml-pipeline-setup)
8. [Docker & Containerization](#docker--containerization)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Production Deployment](#production-deployment)
11. [Monitoring & Logging](#monitoring--logging)
12. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

**System Requirements**:
- macOS, Linux, or Windows (with WSL2)
- Git 2.34+
- Docker 20.10+
- Node.js 18.16+
- Python 3.10+
- PostgreSQL 14+ (local or Docker)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/prediction-app.git
cd prediction-app
```

#### 2. Install Node Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (Web)
cd ../web
npm install

# Mobile (React Native)
cd ../mobile
npm install
```

#### 3. Install Python Dependencies
```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

#### 4. Set Up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your_project_ref

# Start local Supabase
supabase start
```

---

## Project Structure

```
prediction-app/
├── backend/                      # Node.js Express API
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Express middleware
│   │   ├── jobs/                # Background jobs
│   │   ├── utils/               # Helper functions
│   │   ├── types/               # TypeScript types
│   │   └── app.ts               # Express app setup
│   ├── tests/                   # Jest tests
│   ├── migrations/              # Database migrations
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   └── package.json
│
├── web/                          # React web app
│   ├── src/
│   │   ├── pages/               # Next.js pages
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   ├── redux/               # Redux store
│   │   ├── styles/              # CSS/SCSS
│   │   └── App.tsx
│   ├── public/                  # Static assets
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── mobile/                       # React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── redux/
│   │   └── App.tsx
│   ├── app.json                 # Expo config
│   └── package.json
│
├── ml/                           # Python ML engine
│   ├── src/
│   │   ├── astrology/           # Astrology calculations
│   │   ├── models/              # ML models
│   │   ├── api/                 # FastAPI endpoints
│   │   ├── utils/               # Utilities
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── infra/                        # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── ml-deployment.yaml
│   ├── redis-deployment.yaml
│   ├── ingress.yaml
│   └── services.yaml
│
├── scripts/                      # Utility scripts
│   ├── setup-db.sh
│   ├── migrate-data.js
│   └── deploy.sh
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
└── .github/
    └── workflows/               # GitHub Actions
        ├── test.yml
        ├── deploy-staging.yml
        └── deploy-production.yml
```

---

## Environment Configuration

### Backend .env

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=30d

# ML Engine
ML_ENGINE_URL=http://localhost:8000
ML_ENGINE_API_KEY=your-api-key

# Stripe/Razorpay
STRIPE_SECRET_KEY=sk_test_xxx
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email Service
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@prediction-app.com

# External APIs
GOOGLE_FIT_API_KEY=xxx
PLAID_CLIENT_ID=xxx
PLAID_SECRET=xxx

# Redis
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prediction_app
```

### Frontend .env

```bash
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=eyJxxx...
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
REACT_APP_LOG_LEVEL=debug
```

### Mobile app.json (Expo)

```json
{
  "expo": {
    "name": "PredictionApp",
    "slug": "prediction-app",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "platforms": ["ios", "android"],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "versionCode": 1,
      "package": "com.predictionapp.mobile"
    },
    "ios": {
      "supportsTabletMode": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need access to your location for birth chart calculation"
      }
    },
    "extra": {
      "apiUrl": "https://api.prediction-app.com/api",
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseKey": "eyJxxx..."
    }
  }
}
```

---

## Database Setup

### Using Supabase

#### 1. Create Supabase Project
```bash
# Visit supabase.com and create a new project
# Get your project URL and API keys
```

#### 2. Run Schema Migration
```bash
# Using Supabase CLI
supabase db push

# Or manually paste the SQL schema in Supabase dashboard
# Go to SQL Editor → paste schema → Run
```

#### 3. Seed Initial Data (Optional)
```bash
# Create seed script
touch backend/seeds/initial-seed.ts

# Run seeding
npm run seed
```

#### 4. Verify Tables
```bash
# Using Supabase CLI
supabase db list

# Or query in dashboard
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

---

## Backend Development

### Start Development Server

```bash
cd backend

# Install dependencies
npm install

# Run type checking
npm run type-check

# Start development server (with auto-reload)
npm run dev
```

**Server runs on**: `http://localhost:3000`

### Key Backend Commands

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Build for production
npm run build

# Start production build
npm run start

# Generate TypeScript types from Supabase schema
npm run generate:types
```

### Create New API Route

```typescript
// backend/src/routes/example.ts
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/example
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.supabase
      .from('some_table')
      .select('*');
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

export default router;
```

---

## Frontend Development

### Start Web Development Server

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

**Web app runs on**: `http://localhost:3000`

### Key Web Commands

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format
npm run lint
npm run format

# Type check
npm run type-check
```

### Start Mobile Development Server

```bash
cd mobile

# Install dependencies
npm install

# Start Expo server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Scan QR code with Expo app on physical device
# (show QR code from terminal)
```

---

## ML Pipeline Setup

### Start ML Engine

```bash
cd ml

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn src.main:app --reload --port 8000
```

**ML API runs on**: `http://localhost:8000`

### Key ML Commands

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=src tests/

# Format code
black src/

# Lint code
pylint src/

# Type checking
mypy src/

# Train models
python scripts/train_models.py

# Generate embeddings
python scripts/generate_embeddings.py
```

---

## Docker & Containerization

### Build Docker Images

```bash
# Build backend image
docker build -t prediction-app:backend ./backend

# Build ML engine image
docker build -t prediction-app:ml ./ml

# Build web app image
docker build -t prediction-app:web ./web
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Docker Compose File

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/db
      SUPABASE_URL: ${SUPABASE_URL}
      ML_ENGINE_URL: http://ml:8000
    depends_on:
      - postgres
      - redis

  ml:
    build: ./ml
    ports:
      - "8000:8000"
    environment:
      LOG_LEVEL: info

  web:
    build: ./web
    ports:
      - "3001:3000"
    environment:
      REACT_APP_API_URL: http://localhost:3000/api

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: prediction_app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../web && npm ci
      
      - name: Run tests
        run: npm test --workspaces
      
      - name: Build
        run: npm run build --workspaces

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker images
        run: |
          docker build -t gcr.io/project/backend:${{ github.sha }} ./backend
          docker push gcr.io/project/backend:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend \
            backend=gcr.io/project/backend:${{ github.sha }}
          kubectl rollout status deployment/backend
```

---

## Production Deployment

### Deploy to Kubernetes

```bash
# 1. Build images
docker build -t prediction-app:backend-1.0.0 ./backend
docker push your-registry/prediction-app:backend-1.0.0

# 2. Update deployment
kubectl apply -f infra/backend-deployment.yaml

# 3. Verify deployment
kubectl get deployments
kubectl get pods
kubectl logs -f deployment/prediction-backend

# 4. Check service
kubectl get svc prediction-backend
```

### Health Checks

```bash
# Check API health
curl https://api.prediction-app.com/health

# Check ML engine health
curl https://ml-api.prediction-app.com/health

# Monitor logs
kubectl logs -f deployment/prediction-backend --all-containers=true
```

### Database Backups

```bash
# Backup Supabase database
supabase db pull

# Export to SQL file
pg_dump postgresql://user:pass@host/db > backup.sql

# Restore from backup
psql postgresql://user:pass@host/db < backup.sql
```

---

## Monitoring & Logging

### Set Up Monitoring

```bash
# Install Datadog agent
helm install datadog datadog/datadog -f datadog-values.yaml

# View metrics dashboard
open https://app.datadoghq.com

# Set up alerts
# Navigate to Monitors → New Monitor → Metric Alert
```

### View Logs

```bash
# View backend logs
kubectl logs deployment/prediction-backend

# View ML engine logs
kubectl logs deployment/prediction-ml

# Real-time log streaming
kubectl logs -f deployment/prediction-backend

# View logs for specific pod
kubectl logs pod/prediction-backend-xyz
```

### Performance Monitoring

```bash
# Check resource usage
kubectl top node
kubectl top pod

# View metrics
kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/default/pods
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check Supabase connectivity
curl https://your-project.supabase.co

# Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Test connection from backend
npm run test:db-connection
```

#### 2. ML Engine Not Responding

```bash
# Check ML service
curl http://ml-api:8000/health

# View ML logs
docker logs prediction-app-ml

# Restart ML service
kubectl restart deployment prediction-ml
```

#### 3. High Memory Usage

```bash
# Check memory usage
kubectl top pods

# View pod details
kubectl describe pod prediction-backend-xyz

# Increase limits in deployment
kubectl set resources deployment prediction-backend \
  --limits=memory=1Gi,cpu=1000m
```

#### 4. Database Migrations Failed

```bash
# Check migration status
supabase migration list

# Rollback last migration
supabase migration down

# View migration logs
supabase migration info --version latest
```

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_user_predictions ON predictions(user_id, created_at DESC);
CREATE INDEX idx_metrics_user_date ON user_metrics(user_id, metric_date DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM predictions WHERE user_id = 'xxx';
```

### Caching Strategy

```typescript
// Cache predictions for 1 hour
const cacheKey = `predictions:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await fetchFromDatabase();
await redis.setex(cacheKey, 3600, JSON.stringify(data));

return data;
```

### API Response Compression

```typescript
// Enable gzip compression in Express
import compression from 'compression';

app.use(compression());
```

---

## Testing Strategy

### Unit Tests

```bash
# Backend
cd backend
npm test -- --watch

# ML
cd ml
pytest --watch
```

### Integration Tests

```bash
# Run with test database
npm run test:integration
```

### E2E Tests

```bash
# Using Cypress
npm run test:e2e

# Using Playwright
npm run test:playwright
```

---

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] HTTPS enforced in production
- [ ] JWT tokens validated on all protected routes
- [ ] RLS policies enabled on all tables
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection prevented with parameterized queries
- [ ] Secrets rotated regularly
- [ ] Security headers configured
- [ ] Dependency vulnerabilities scanned (npm audit)

---

## Release Process

### Creating a Release

```bash
# 1. Create release branch
git checkout -b release/1.0.0

# 2. Update version numbers
npm version minor

# 3. Update CHANGELOG.md
# 4. Create pull request
# 5. Merge to main
# 6. Create git tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 7. GitHub creates release from tag automatically
```

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
**Status**: Production Ready
