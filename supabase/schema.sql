-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================ 
-- AUTHENTICATION & USER MANAGEMENT 
-- ============================================================================ 
 
-- Users Profile (extends Supabase auth.users) 
CREATE TABLE IF NOT EXISTS public.user_profiles ( 
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
CREATE TABLE IF NOT EXISTS public.birth_charts ( 
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
   
  FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL 
); 
 
-- ============================================================================ 
-- PREDICTIONS DATA 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.predictions ( 
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
  
  -- Model Link
  model_id UUID -- FK added below
);

-- ============================================================================ 
-- ML MODEL MANAGEMENT 
-- ============================================================================ 
CREATE TABLE IF NOT EXISTS public.model_registry ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  name VARCHAR(100) NOT NULL,    -- e.g., 'income_forecast_hybrid'
  version VARCHAR(50) NOT NULL,  -- e.g., '1.0.0'
  type VARCHAR(50),              -- 'arima', 'lstm', 'random_forest'
  status VARCHAR(20) DEFAULT 'staging', -- 'production', 'staging', 'archived'
  
  -- Configuration
  parameters JSONB,              -- Hyperparameters {p:1, d:1, q:1}
  features_config JSONB,         -- Required input features
  
  -- Metrics
  training_metrics JSONB,        -- {rmse: 0.05, accuracy: 0.92}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(name, version)
);

CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.model_registry(id),
  
  -- Data Scope
  training_data_start_date DATE,
  training_data_end_date DATE,
  sample_size INTEGER,
  
  -- Comparison
  previous_model_version VARCHAR(50),
  performance_improvement DECIMAL(5, 2), -- % improvement
  
  status VARCHAR(50), -- 'running', 'completed', 'failed'
  logs TEXT,
  
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prediction Link
-- (We use DO block to add constraint safely if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prediction_model') THEN
        ALTER TABLE public.predictions 
        ADD CONSTRAINT fk_prediction_model 
        FOREIGN KEY (model_id) REFERENCES public.model_registry(id) ON DELETE SET NULL;
    END IF;
END $$;
 
-- ============================================================================ 
-- USER BEHAVIOR & METRICS 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.user_metrics ( 
  id BIGSERIAL PRIMARY KEY, 
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
   
  -- Metric Type 
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('income', 'expense', 'mood_score', 'sleep_hours', 'work_hours', 'exercise_minutes', 'meditation_minutes', 'caffeine_cups', 'meetings_count')), 
   
  -- Value 
  metric_date DATE NOT NULL, 
  metric_value DECIMAL(12, 2), 
   
  -- Context 
  category VARCHAR(100),  -- For expenses: food, travel, etc. 
  notes TEXT, 
  source VARCHAR(50), -- manual, plaid, google_fit, apple_health 
   
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
-- ============================================================================ 
-- CONSULTATIONS 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.consultations ( 
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
  FOREIGN KEY (astrologer_id) REFERENCES auth.users(id) ON DELETE CASCADE 
); 
 
-- ============================================================================ 
-- MESSAGING/CHAT 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.consultation_messages ( 
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
   
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
-- ============================================================================ 
-- SUBSCRIPTIONS & PAYMENTS 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.subscriptions ( 
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
CREATE TABLE IF NOT EXISTS public.transactions ( 
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
   
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
-- ============================================================================ 
-- ASTROLOGER PROFILES & RATINGS 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.astrologer_profiles ( 
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
CREATE TABLE IF NOT EXISTS public.astrologer_ratings ( 
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE, 
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
  astrologer_id UUID NOT NULL REFERENCES public.astrologer_profiles(id) ON DELETE CASCADE, 
   
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), 
  review_text TEXT, 
  is_helpful BOOLEAN DEFAULT TRUE, 
   
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
-- ============================================================================ 
-- MARKETPLACE (Gemstones, Remedies) 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.marketplace_products ( 
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
 
CREATE TABLE IF NOT EXISTS public.orders ( 
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 
-- ============================================================================ 
-- RECOMMENDATIONS & AI FEATURES 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.astrology_article_embeddings ( 
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
CREATE INDEX IF NOT EXISTS idx_embeddings_ivfflat ON public.astrology_article_embeddings USING ivfflat (embedding vector_cosine_ops); 
 
-- ============================================================================ 
-- SETTINGS & PREFERENCES 
-- ============================================================================ 
 
CREATE TABLE IF NOT EXISTS public.user_preferences ( 
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
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astrologer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astrologer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astrology_article_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
 
-- Policies: Users can only see their own data 
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id); 

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id); 

DROP POLICY IF EXISTS "Users can view own birth chart" ON public.birth_charts;
CREATE POLICY "Users can view own birth chart" 
  ON public.birth_charts FOR SELECT 
  USING (auth.uid() = user_id); 

DROP POLICY IF EXISTS "Users can view own predictions" ON public.predictions;
CREATE POLICY "Users can view own predictions" 
  ON public.predictions FOR SELECT 
  USING (auth.uid() = user_id); 

DROP POLICY IF EXISTS "Users can view own metrics" ON public.user_metrics;
CREATE POLICY "Users can view own metrics" 
  ON public.user_metrics FOR SELECT 
  USING (auth.uid() = user_id); 

DROP POLICY IF EXISTS "Users can insert own metrics" ON public.user_metrics;
CREATE POLICY "Users can insert own metrics" 
  ON public.user_metrics FOR INSERT 
  WITH CHECK (auth.uid() = user_id); 

-- Consultations: Both parties can view 
DROP POLICY IF EXISTS "Consultation participants can view" ON public.consultations;
CREATE POLICY "Consultation participants can view" 
  ON public.consultations FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = astrologer_id); 

-- Messages: Only consultation participants can view 
DROP POLICY IF EXISTS "Message participants can view" ON public.consultation_messages;
CREATE POLICY "Message participants can view" 
  ON public.consultation_messages FOR SELECT 
  USING ( 
    EXISTS ( 
      SELECT 1 FROM public.consultations 
      WHERE consultations.id = consultation_messages.consultation_id 
      AND (consultations.user_id = auth.uid() OR consultations.astrologer_id = auth.uid()) 
    ) 
  ); 

DROP POLICY IF EXISTS "Message senders can insert" ON public.consultation_messages;
CREATE POLICY "Message senders can insert" 
  ON public.consultation_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Astrologer Profiles (Public Read, Owner Update)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.astrologer_profiles;
CREATE POLICY "Public profiles are viewable" 
  ON public.astrologer_profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Astrologers can update own profile" ON public.astrologer_profiles;
CREATE POLICY "Astrologers can update own profile" 
  ON public.astrologer_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Astrologer Ratings (Public Read, Auth Insert)
DROP POLICY IF EXISTS "Ratings are viewable" ON public.astrologer_ratings;
CREATE POLICY "Ratings are viewable" 
  ON public.astrologer_ratings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can rate" ON public.astrologer_ratings;
CREATE POLICY "Authenticated users can rate" 
  ON public.astrologer_ratings FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Marketplace (Public Read)
DROP POLICY IF EXISTS "Products are viewable" ON public.marketplace_products;
CREATE POLICY "Products are viewable" 
  ON public.marketplace_products FOR SELECT 
  USING (true);

-- Knowledge Base (Public Read)
DROP POLICY IF EXISTS "Articles are viewable" ON public.astrology_article_embeddings;
CREATE POLICY "Articles are viewable" 
  ON public.astrology_article_embeddings FOR SELECT 
  USING (true);

-- Model Registry (Public Read for App/ML)
DROP POLICY IF EXISTS "Models are viewable" ON public.model_registry;
CREATE POLICY "Models are viewable" 
  ON public.model_registry FOR SELECT 
  USING (true);

-- ============================================================================ 
-- INDEXES FOR PERFORMANCE 
-- ============================================================================ 
 
CREATE INDEX IF NOT EXISTS idx_birth_charts_user ON public.birth_charts(user_id); 
CREATE INDEX IF NOT EXISTS idx_predictions_category_date ON public.predictions(category, period_start DESC); 
CREATE INDEX IF NOT EXISTS idx_metrics_user_type_date ON public.user_metrics(user_id, metric_type, metric_date DESC); 
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, created_at DESC); 
CREATE INDEX IF NOT EXISTS idx_consultations_user_date ON public.consultations(user_id, scheduled_at DESC); 
CREATE INDEX IF NOT EXISTS idx_messages_consultation_date ON public.consultation_messages(consultation_id, created_at DESC);

-- Additional Indexes (Moved from inline to explicit CREATE INDEX)
CREATE INDEX IF NOT EXISTS idx_user_predictions ON public.predictions (user_id);
CREATE INDEX IF NOT EXISTS idx_period_predictions ON public.predictions (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_metrics_date ON public.user_metrics (user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_metric_type_date_solo ON public.user_metrics (metric_type, metric_date);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON public.user_metrics (recorded_at);
CREATE INDEX IF NOT EXISTS idx_astrologer_consultations ON public.consultations (astrologer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_status ON public.consultations (status);
CREATE INDEX IF NOT EXISTS idx_sender_messages ON public.consultation_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at_solo ON public.consultation_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscription ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON public.transactions (transaction_type);
CREATE INDEX IF NOT EXISTS idx_specialty ON public.astrologer_profiles (specialty);
CREATE INDEX IF NOT EXISTS idx_verified ON public.astrologer_profiles (verified);
CREATE INDEX IF NOT EXISTS idx_astrologer_ratings_astrologer ON public.astrologer_ratings (astrologer_id);
CREATE INDEX IF NOT EXISTS idx_astrologer_ratings_user ON public.astrologer_ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_user_orders ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON public.orders (status);

-- ============================================================================ 
-- TRIGGERS & FUNCTIONS 
-- ============================================================================ 

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, first_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on insert to auth.users
-- Use DO block to safely drop if exists (Postgres < 14 doesn't support CR OR REPLACE TRIGGER)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();