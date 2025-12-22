# Architecture Quick Reference - Supabase Edition

## 🏗️ System Architecture at a Glance

### Before (Traditional Stack)
```
Multiple Databases:
- PostgreSQL (relational)
- MongoDB (documents)
- TimescaleDB (time-series)
- Redis (cache)
- Elasticsearch (search)

Cost: ₹3.1L/month
Complexity: Very High
```

### After (Supabase Stack)
```
Single Platform:
- PostgreSQL with pgvector
- Real-time WebSocket built-in
- Storage included
- Auth with OAuth
- Row-Level Security

Cost: ₹48K/month (85% reduction)
Complexity: Low
```

---

## 📊 Quick Comparison

| Aspect | Traditional | Supabase |
|--------|------------|----------|
| **Database** | PostgreSQL + MongoDB | PostgreSQL only |
| **Real-time** | Redis Pub/Sub | Built-in WebSocket |
| **Cache** | Separate Redis | PostgreSQL + Materialized Views |
| **Auth** | Custom JWT | Native Auth |
| **File Storage** | S3 + config | Built-in Storage |
| **Search** | Elasticsearch | Full-text search in PostgreSQL |
| **Cost/month** | ₹3,10,000 | ₹48,000 |
| **Setup Time** | 4-6 weeks | 1 week |
| **DevOps Complexity** | High | Low |

---

## 📋 Database Schema (Single PostgreSQL)

### Core Tables
```
auth.users (Supabase native)
├── user_profiles
├── user_preferences
├── birth_charts
├── predictions
├── user_metrics
└── astrology_article_embeddings (pgvector)

Consultations
├── consultations
├── consultation_messages
├── astrologer_profiles
└── astrologer_ratings

Payments & Orders
├── subscriptions
├── transactions
├── orders
└── marketplace_products
```

---

## 🔌 API Layer Architecture

```
Clients (Mobile/Web)
        ↓
  Supabase Client SDK
        ↓
┌────────────────────────────────┐
│   Supabase Backend             │
├────────────────────────────────┤
│ • Auto-generated REST API      │
│ • Real-time WebSocket         │
│ • Auth (JWT)                  │
│ • Row-Level Security          │
│ • Storage API                 │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Node.js Express Server         │
├────────────────────────────────┤
│ • Business Logic              │
│ • ML Integration              │
│ • Payment Processing          │
│ • Notification Service        │
└────────────────────────────────┘
```

---

## 🚀 Key Features Implementation

### 1. Real-Time Updates
**Traditional**: Redis + custom WebSocket code
**Supabase**: Built-in, 1 line of code

```typescript
// Subscribe to prediction updates
supabase
  .channel(`predictions:${userId}`)
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'predictions' },
    (payload) => updateUI(payload.new)
  )
  .subscribe();
```

### 2. Authentication
**Traditional**: JWT + custom OAuth integration
**Supabase**: Native, with MFA support

```typescript
// Email signup
await supabase.auth.signUp({ email, password });

// OAuth (Google/Apple/GitHub)
await supabase.auth.signInWithOAuth({ provider: 'google' });

// MFA enrollment
await supabase.auth.mfa.enroll({ factorType: 'totp' });
```

### 3. File Storage
**Traditional**: S3 + bucket management
**Supabase**: Built-in Storage buckets

```typescript
// Upload birth chart
await supabase.storage
  .from('birth-charts')
  .upload(`user-${userId}/chart.pdf`, file);

// Get public URL
const { publicUrl } = supabase.storage
  .from('birth-charts')
  .getPublicUrl(`user-${userId}/chart.pdf`);
```

### 4. Data Isolation (Row-Level Security)
**Traditional**: Custom authorization logic in code
**Supabase**: Automatic with RLS policies

```sql
-- Users can only see their own predictions
CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);
```

### 5. Vector Search (AI Recommendations)
**Traditional**: Separate Elasticsearch instance
**Supabase**: pgvector built-in

```sql
-- Store article embeddings
CREATE TABLE astrology_article_embeddings (
  id UUID PRIMARY KEY,
  embedding vector(1536),
  article_id UUID
);

CREATE INDEX ON astrology_article_embeddings 
  USING ivfflat (embedding vector_cosine_ops);
```

```typescript
// Find similar articles
const { data } = await supabase
  .from('astrology_article_embeddings')
  .select('*')
  .match({ embedding: userEmbedding })
  .limit(5);
```

---

## 📈 Scaling Strategy

### Development (Free Tier)
- Up to 500MB database
- 50,000 monthly active users
- Perfect for MVP

### Growth (Pro Tier)
- Unlimited database size
- 100K-500K MAU
- ₹3,000-10,000/month

### Enterprise
- Custom compute instances
- Dedicated database
- Priority support
- Contact Supabase sales

---

## 🔐 Security Features

✅ **Row-Level Security (RLS)**
- Automatic per-user data isolation
- No custom authorization code needed

✅ **JWT Authentication**
- Secure token-based auth
- 15-minute access tokens
- Refresh token rotation

✅ **OAuth2 Integration**
- Google, Apple, GitHub support
- Social login seamlessly

✅ **Encryption**
- Data encrypted in transit (TLS)
- Optional field-level encryption

✅ **Audit Logs**
- Track all data changes
- Built-in versioning

---

## 🛠️ Development Workflow

### Setup (30 minutes)
```bash
# 1. Create Supabase project
visit supabase.com → create project

# 2. Get credentials
SUPABASE_URL = https://xxxx.supabase.co
SUPABASE_KEY = eyJxxx...

# 3. Install SDK
npm install @supabase/supabase-js

# 4. Initialize client
const supabase = createClient(URL, KEY);
```

### Local Development
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push

# See changes real-time
supabase functions serve
```

### Deployment
```bash
# Push schema to production
supabase db push --linked

# Deploy edge functions
supabase functions deploy

# View logs
supabase functions logs
```

---

## 💰 Cost Breakdown (100K MAU)

### Monthly Costs
```
Supabase Base:           ₹3,000
Database (5GB):          ₹20,000
Storage (50GB):          ₹10,000
Real-time (500K events): ₹10,000
Auth (100K users):       ₹5,000
Edge Functions:          ₹3,000
                        --------
Total:                  ₹51,000/month

Yearly: ₹6.12 lakhs
```

### Compared to Traditional Stack
```
Traditional:  ₹3,10,000/month → ₹37.2 lakhs/year
Supabase:     ₹51,000/month   → ₹6.12 lakhs/year

Savings:      ₹31,44,000/year (85% reduction)
```

---

## 🔄 Data Migration from Existing Databases

### Step 1: Export Data
```sql
-- From PostgreSQL
pg_dump -U user -h localhost dbname > users.sql

-- From MongoDB
mongodump --db mydb --out ./data
```

### Step 2: Transform & Import
```typescript
// Convert MongoDB documents to PostgreSQL rows
const users = await mongodb.collection('users').find({}).toArray();
const { data } = await supabase
  .from('user_profiles')
  .insert(users);
```

### Step 3: Validate
```typescript
// Compare row counts
const legacyCount = await mongodb.collection('users').countDocuments();
const { count } = await supabase
  .from('user_profiles')
  .select('*', { count: 'exact' });

console.assert(legacyCount === count);
```

---

## 🏃 Implementation Roadmap

### Week 1: Foundation
- [ ] Create Supabase project
- [ ] Run schema SQL
- [ ] Set up Auth (email + OAuth)
- [ ] Configure Storage buckets

### Week 2: Migration
- [ ] Export data from existing databases
- [ ] Import into Supabase
- [ ] Validate data integrity
- [ ] Set up automated backups

### Week 3: API Updates
- [ ] Update backend to use Supabase SDK
- [ ] Implement real-time subscriptions
- [ ] Migrate file uploads
- [ ] Test all endpoints

### Week 4: Deployment
- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] Canary release (10% users)
- [ ] Monitor metrics
- [ ] Full rollout

---

## ✅ Checklist: Migration to Supabase

### Pre-Migration
- [ ] Backup all existing data
- [ ] Document current API contracts
- [ ] List all third-party integrations
- [ ] Plan downtime window

### During Migration
- [ ] Create Supabase project
- [ ] Configure Auth providers
- [ ] Import schema and data
- [ ] Update environment variables
- [ ] Deploy updated backend code
- [ ] Update frontend clients
- [ ] Test critical paths

### Post-Migration
- [ ] Monitor error rates
- [ ] Check real-time updates
- [ ] Verify file uploads
- [ ] Confirm auth flows
- [ ] Monitor performance metrics
- [ ] Document any issues
- [ ] Celebrate savings! 🎉

---

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Real-time Subscriptions Guide](https://supabase.com/docs/guides/realtime)
- [Row-Level Security Tutorial](https://supabase.com/docs/guides/auth/row-level-security)

---

## ⚡ Quick Reference: Common Operations

### Query Data
```typescript
// Select
const { data } = await supabase
  .from('predictions')
  .select('*')
  .eq('category', 'career');

// With filtering
const { data } = await supabase
  .from('predictions')
  .select('*')
  .gte('created_at', '2025-01-01')
  .lte('created_at', '2025-12-31');
```

### Insert Data
```typescript
const { data, error } = await supabase
  .from('user_metrics')
  .insert([
    { user_id, metric_type: 'income', metric_value: 50000 }
  ])
  .select();
```

### Update Data
```typescript
const { data } = await supabase
  .from('consultations')
  .update({ status: 'completed' })
  .eq('id', consultationId);
```

### Delete Data
```typescript
await supabase
  .from('predictions')
  .delete()
  .eq('id', predictionId);
```

### Real-time Listen
```typescript
supabase
  .channel('predictions')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'predictions' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

---

## 🎓 Learning Resources

### For Database Design
- Supabase University (YouTube)
- PostgreSQL official docs
- Database normalization guides

### For Real-time Features
- Supabase real-time guide
- WebSocket basics
- Socket.io documentation

### For Security
- OWASP security guide
- JWT best practices
- RLS policy patterns

---

## 🆘 Troubleshooting

### Connection Issues
```typescript
// Check connection
const { data, error } = await supabase.auth.getUser();
if (error) console.log('Connection failed:', error);
```

### RLS Policy Blocking Queries
```typescript
// Use service role key to bypass RLS (backend only)
const adminClient = createClient(URL, SERVICE_KEY);
```

### Real-time Not Updating
```typescript
// Check WebSocket connection
console.log(supabase.realtime.state); // should be 'connected'
```

### Storage Upload Failing
```typescript
// Check bucket name and permissions
// Ensure bucket is public or RLS allows access
```

---

## 📱 Service Architecture Overview

### Microservices Simplified with Supabase

**Traditional Approach (7+ services)**:
- auth-service
- user-service
- astrology-engine
- behavior-analytics
- prediction-service
- consultation-service
- payment-service

**Supabase Approach (2 layers)**:
1. **Supabase** - Database, Auth, Real-time, Storage
2. **Node.js Express** - Business Logic, ML, Payments

This dramatically reduces operational complexity while maintaining scalability.

---

## 🔄 Real-Time Event Flow

```
User Action (Mobile/Web)
        ↓
Supabase Client SDK
        ↓
Database Update (PostgreSQL)
        ↓
Trigger Real-time Event
        ↓
All Subscribed Clients Notified
        ↓
UI Updates Instantly (No polling!)
```

---

## 🎯 Success Metrics

After migration to Supabase, track:

- **Infrastructure Cost**: Target 85% reduction (₹3.1L → ₹48K/month)
- **Deployment Time**: Target <10 minutes
- **API Response Time**: Target <100ms p95
- **Real-time Latency**: Target <500ms for updates
- **Data Migration Time**: Target <4 hours
- **Team Productivity**: Target 30% faster feature development

---

**Last Updated**: December 20, 2025
**Version**: Supabase Edition 1.0
**Status**: Production Ready
