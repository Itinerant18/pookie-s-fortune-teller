# Supabase Integration for Hybrid Prediction App

## Database Migration from PostgreSQL/MongoDB to Supabase

### Why Supabase?

✅ **All-in-One Backend Solution**:
- PostgreSQL database built-in (no separate database needed)
- Real-time subscriptions (WebSocket built-in)
- Authentication with JWT, OAuth, MFA
- File storage (bucket system)
- Row-level security (RLS) for data isolation
- pgvector for embeddings/AI features
- Significantly reduces infrastructure complexity

✅ **Cost Efficient**:
- Single platform instead of 5-6 separate services
- No managing infrastructure
- Pay-as-you-go pricing
- Free tier for development
- Estimated: ₹30K-50K/month vs ₹1.5L+ for traditional stack

✅ **Developer Experience**:
- Built-in API generation from schema
- Real-time updates without WebSocket code
- Excellent documentation
- Community-driven

---

## Updated Architecture with Supabase

### System Overview (Supabase-Centric)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────┬──────────────────┬──────────────────┤
│  Mobile App (RN)    │  Web App (React) │  Admin Dashboard  │
│  (iOS/Android)      │  (SPA)           │  (Analytics)      │
└──────────┬──────────┴──────────┬───────┴──────────┬────────┘
           │                     │                  │
           └─────────────────────┼──────────────────┘
                API Layer (Node.js + Express)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌──────────────────────────────────────────┐
   │            SUPABASE BACKEND              │
   ├──────────────────────────────────────────┤
   │                                          │
   │  ┌──────────────────────────────────┐   │
   │  │    PostgreSQL Database           │   │
   │  │  (All tables + pgvector)         │   │
   │  └──────────────────────────────────┘   │
   │                                          │
   │  ┌──────────────────────────────────┐   │
   │  │  Real-time Subscriptions         │   │
   │  │  (WebSocket built-in)            │   │
   │  └──────────────────────────────────┘   │
   │                                          │
   │  ┌──────────────────────────────────┐   │
   │  │  Auth (JWT + OAuth)              │   │
   │  │  Row-Level Security (RLS)        │   │
   │  └──────────────────────────────────┘   │
   │                                          │
   │  ┌──────────────────────────────────┐   │
   │  │  Storage (File uploads)          │   │
   │  │  Bucket system                   │   │
   │  └──────────────────────────────────┘   │
   │                                          │
   └──────────────────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────────┐   ┌──────────────┐
│   Redis     │   │ ML Engine    │
│   (Cache)   │   │ (Python)     │
└─────────────┘   └──────────────┘
    │                    │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  User API Output   │
    │  (Real-time)       │
    └────────────────────┘
```

---

## Supabase Schema Design

### Complete PostgreSQL Schema (In Supabase)

```sql
-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Users Profile (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender VARCHAR(10),
  profile_image_url TEXT,
  bio TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, premium, pro
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Birth Chart Data
CREATE TABLE public.birth_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Birth Details
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_timezone VARCHAR(50),
  
  -- Location
  birth_location_name VARCHAR(255),
  birth_location_lat DECIMAL(10, 8),
  birth_location_lng DECIMAL(11, 8),
  
  -- Astrological Data (JSONB for flexibility)
  planets JSONB,  -- {sun: {sign, degree, house}, ...}
  houses JSONB,   -- {1: {sign, lord}, ...}
  divisional_charts JSONB, -- {d9: {...}, d10: {...}}
  
  -- Dasha Information
  current_dasha JSONB,
  dasha_sequence JSONB,
  
  -- Analysis
  yogas JSONB,    -- Auspicious combinations
  doshas JSONB,   -- Inauspicious combinations
  
  -- Metadata
  birth_time_accuracy VARCHAR(20), -- exact, approximate, unknown
  verified_at TIMESTAMP,
  verified_by UUID,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  INDEX idx_user_birth_charts (user_id)
);

-- ============================================================================
-- PREDICTIONS DATA
-- ============================================================================

CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Prediction Metadata
  category VARCHAR(50) NOT NULL, -- career, health, finance, relationship
  prediction_type VARCHAR(50),   -- astrology, behavior, hybrid
  timeframe VARCHAR(50),         -- 1_month, 3_months, 6_months, 12_months
  
  -- Time Period
  period_start DATE,
  period_end DATE,
  
  -- Prediction Data (JSONB)
  astrology_prediction JSONB,
  behavior_prediction JSONB,
  combined_prediction JSONB,
  
  -- Confidence & Accuracy
  astrology_confidence DECIMAL(3, 2),
  behavior_confidence DECIMAL(3, 2),
  overall_confidence DECIMAL(3, 2),
  
  -- Outcome Tracking
  actual_outcome JSONB,   -- Recorded after period ends
  accuracy_score DECIMAL(3, 2),
  user_feedback VARCHAR(50), -- accurate, partially_accurate, inaccurate
  
  -- Lifecycle
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_predictions (user_id),
  INDEX idx_category_predictions (category),
  INDEX idx_period_predictions (period_start, period_end)
);

-- ============================================================================
-- USER BEHAVIOR & METRICS
-- ============================================================================

CREATE TABLE public.user_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metric Type
  metric_type VARCHAR(50) NOT NULL, -- income, expense, mood, sleep, exercise
  
  -- Value
  metric_date DATE NOT NULL,
  metric_value DECIMAL(12, 2),
  
  -- Context
  category VARCHAR(100),  -- For expenses: food, travel, etc.
  notes TEXT,
  source VARCHAR(50), -- manual, plaid, google_fit, apple_health
  
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_metrics (user_id, metric_date),
  INDEX idx_metric_type_date (metric_type, metric_date),
  INDEX idx_recorded_at (recorded_at)
);

-- ============================================================================
-- CONSULTATIONS
-- ============================================================================

CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  astrologer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Consultation Details
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  consultation_type VARCHAR(20), -- video, audio, chat
  duration_minutes INTEGER,
  
  -- Scheduling
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Payment
  amount_charged DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(50), -- pending, completed, refunded
  stripe_payment_id VARCHAR(255),
  
  -- Recording
  call_recording_url TEXT,  -- S3 URL or Supabase storage
  recording_duration_seconds INTEGER,
  
  -- Notes
  user_notes TEXT,
  astrologer_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (astrologer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  INDEX idx_user_consultations (user_id),
  INDEX idx_astrologer_consultations (astrologer_id),
  INDEX idx_consultation_status (status)
);

-- ============================================================================
-- MESSAGING/CHAT
-- ============================================================================

CREATE TABLE public.consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message Content
  message_text TEXT,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, file
  media_url TEXT,  -- For images/files stored in Supabase Storage
  
  -- Metadata
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_consultation_messages (consultation_id),
  INDEX idx_sender_messages (sender_id),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- SUBSCRIPTIONS & PAYMENTS
-- ============================================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Details
  tier VARCHAR(20), -- free, premium, pro
  status VARCHAR(50), -- active, cancelled, expired
  
  -- Billing
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Dates
  started_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Features
  features JSONB, -- {predictions_per_month: 10, consultations: true, ...}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_subscription (user_id)
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type VARCHAR(50), -- subscription, consultation, purchase
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Related Entity
  related_id UUID,  -- consultation_id or subscription_id
  description TEXT,
  
  -- Payment
  stripe_payment_id VARCHAR(255),
  payment_method VARCHAR(50), -- card, wallet, bank_transfer
  status VARCHAR(50), -- pending, completed, failed, refunded
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_transactions (user_id),
  INDEX idx_transaction_type (transaction_type)
);

-- ============================================================================
-- ASTROLOGER PROFILES & RATINGS
-- ============================================================================

CREATE TABLE public.astrologer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Professional Info
  specialty VARCHAR(100),  -- career, health, relationships, finance, general
  experience_years INTEGER,
  qualifications TEXT,
  languages TEXT[],  -- ARRAY type in PostgreSQL
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10, 2),
  min_consultation_duration_minutes INTEGER DEFAULT 15,
  max_consultation_duration_minutes INTEGER DEFAULT 120,
  
  -- Stats
  total_consultations INTEGER DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_specialty (specialty),
  INDEX idx_verified (verified)
);

CREATE TABLE public.astrologer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  astrologer_id UUID NOT NULL REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_helpful BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_astrologer_ratings (astrologer_id),
  INDEX idx_user_ratings (user_id)
);

-- ============================================================================
-- MARKETPLACE (Gemstones, Remedies)
-- ============================================================================

CREATE TABLE public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- gemstone, rudraksha, yantra, puja, book
  
  -- Details
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'INR',
  quantity_available INTEGER,
  
  -- Images & Media
  image_urls TEXT[], -- Store multiple images
  
  -- Astrology Association
  associated_planets TEXT[], -- for gemstones
  associated_doshas TEXT[],
  associated_conditions TEXT[],
  
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  
  -- Items (JSONB for flexibility)
  items JSONB, -- [{product_id, quantity, price}, ...]
  
  -- Totals
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2),
  total DECIMAL(10, 2),
  
  -- Shipping
  shipping_address JSONB,
  tracking_number VARCHAR(255),
  
  -- Payment
  stripe_payment_id VARCHAR(255),
  payment_status VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_orders (user_id),
  INDEX idx_order_status (status)
);

-- ============================================================================
-- RECOMMENDATIONS & AI FEATURES
-- ============================================================================

CREATE TABLE public.astrology_article_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  article_id UUID NOT NULL,
  title VARCHAR(500),
  content TEXT,
  
  -- Vector embedding (pgvector)
  embedding vector(1536), -- OpenAI embedding dimension
  
  -- Metadata
  category VARCHAR(100),
  tags TEXT[],
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for vector similarity search
CREATE INDEX ON public.astrology_article_embeddings USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- SETTINGS & PREFERENCES
-- ============================================================================

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Display
  theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  
  -- Notifications
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_predictions BOOLEAN DEFAULT TRUE,
  sms_alerts BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Privacy
  profile_public BOOLEAN DEFAULT FALSE,
  show_birth_chart_public BOOLEAN DEFAULT FALSE,
  
  -- Frequency
  prediction_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birth_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own birth chart"
  ON public.birth_charts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics"
  ON public.user_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
  ON public.user_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Consultations: Both parties can view
CREATE POLICY "Consultation participants can view"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = astrologer_id);

-- Messages: Only consultation participants can view
CREATE POLICY "Message participants can view"
  ON public.consultation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE consultations.id = consultation_messages.consultation_id
      AND (consultations.user_id = auth.uid() OR consultations.astrologer_id = auth.uid())
    )
  );

CREATE POLICY "Message senders can insert"
  ON public.consultation_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_birth_charts_user ON public.birth_charts(user_id);
CREATE INDEX idx_predictions_category_date ON public.predictions(category, period_start DESC);
CREATE INDEX idx_metrics_user_type_date ON public.user_metrics(user_id, metric_type, metric_date DESC);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, created_at DESC);
CREATE INDEX idx_consultations_user_date ON public.consultations(user_id, scheduled_at DESC);
CREATE INDEX idx_messages_consultation_date ON public.consultation_messages(consultation_id, created_at DESC);
```

---

## Supabase Real-Time Features

### Real-Time Subscriptions (WebSocket)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Real-time prediction updates
const channel = supabase
  .channel(`predictions:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'predictions',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New prediction:', payload.new);
      updateUI(payload.new);
    }
  )
  .subscribe();

// Real-time consultation status
supabase
  .channel(`consultations:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'consultations',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Consultation updated:', payload.new.status);
    }
  )
  .subscribe();

// Real-time messages
supabase
  .channel(`messages:${consultationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'consultation_messages',
      filter: `consultation_id=eq.${consultationId}`,
    },
    (payload) => {
      addMessageToChat(payload.new);
    }
  )
  .subscribe();
```

---

## Supabase Authentication

```typescript
// Signup with email
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// OAuth (Google, Apple, GitHub)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://myapp.com/auth/callback',
  },
});

// Session management (automatic)
const { data: { session } } = await supabase.auth.getSession();

// Access JWT token
const token = session?.access_token;

// MFA Setup
const { data, error } = await supabase.auth.mfa.enroll({
  issuer: 'PredictionApp',
  friendlyName: 'My Authenticator',
  factorType: 'totp',
});
```

---

## Supabase Storage for Files

```typescript
// Upload birth chart PDF
const { data, error } = await supabase.storage
  .from('birth-charts')
  .upload(`user-${userId}/chart-${timestamp}.pdf`, pdfFile, {
    cacheControl: '3600',
    upsert: false,
  });

// Upload consultation recording
const { data, error } = await supabase.storage
  .from('consultation-recordings')
  .upload(`consultation-${id}/recording.mp4`, videoFile);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('birth-charts')
  .getPublicUrl(`user-${userId}/chart.pdf`);

// Delete file
await supabase.storage
  .from('birth-charts')
  .remove([`user-${userId}/chart.pdf`]);
```

---

## Cost Comparison

### Traditional Stack (12 months at 100K MAU)
- PostgreSQL: ₹80K/month
- MongoDB: ₹60K/month
- Redis: ₹30K/month
- Elasticsearch: ₹40K/month
- TimescaleDB: ₹50K/month
- Load Balancer & networking: ₹50K/month
- **Total: ₹3,10,000/month** (₹37.2 lakhs/year)

### Supabase Stack (12 months at 100K MAU)
- Supabase Pro: ₹3,000/month (Base)
- Database (pgvector support): ₹20K/month
- Storage (file uploads): ₹10K/month
- Realtime (WebSocket): ₹10K/month
- Auth (JWT + OAuth): ₹5K/month
- **Total: ₹48,000/month** (₹5.76 lakhs/year)

**Savings: ₹31.44 lakhs/year (85% reduction)**

---

## Migration Path from Traditional to Supabase

### Phase 1: Create Supabase Project (Week 1)
- Set up Supabase project
- Create all tables with proper indexes
- Enable RLS policies
- Set up Auth (email + OAuth)

### Phase 2: Data Migration (Week 2)
- Export data from existing databases
- Import into Supabase PostgreSQL
- Validate data integrity
- Set up automated backups

### Phase 3: API Layer Update (Week 3)
- Update Node.js services to use Supabase client
- Implement real-time subscriptions
- Migrate file uploads to Storage
- Test end-to-end

### Phase 4: Gradual Rollout (Week 4)
- Deploy to staging environment
- Canary release (10% users)
- Monitor performance
- Full rollout

---

## Supabase Advantages for Your App

✅ **Built-in Real-time**: No separate WebSocket infrastructure needed
✅ **Row-Level Security**: Automatic data isolation per user
✅ **Vector Support**: pgvector for AI recommendations
✅ **File Storage**: Upload recordings, PDFs, images
✅ **Automatic Backups**: PITR (Point-in-time recovery)
✅ **Monitoring**: Built-in analytics dashboard
✅ **Scalability**: Auto-scales with load
✅ **Developer-Friendly**: Excellent documentation, SDK support

---

## Implementation with Node.js + Express

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key in backend
);

// Get user prediction
app.get('/api/predictions/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return res.status(400).json(error);
  res.json(data);
});

// Insert new metrics
app.post('/api/metrics', async (req, res) => {
  const { data, error } = await supabase
    .from('user_metrics')
    .insert({
      user_id: req.user.id,
      metric_type: req.body.type,
      metric_value: req.body.value,
      metric_date: new Date(),
      category: req.body.category,
    })
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

// Update consultation status
app.patch('/api/consultations/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('consultations')
    .update({ status: req.body.status })
    .eq('id', req.params.id)
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});
```

---

## Next Steps

1. **Set up Supabase Project**
   - Create account at supabase.com
   - Create new project
   - Copy URL & keys

2. **Run Schema SQL**
   - Execute the full PostgreSQL schema in SQL editor

3. **Configure Auth**
   - Set up OAuth providers
   - Configure email templates
   - Enable MFA

4. **Update Backend**
   - Replace MongoDB/PostgreSQL clients with Supabase SDK
   - Implement real-time subscriptions
   - Migrate file uploads to Storage

5. **Test & Deploy**
   - Run full test suite
   - Canary release
   - Monitor metrics

This Supabase approach dramatically simplifies your architecture while maintaining all functionality!
