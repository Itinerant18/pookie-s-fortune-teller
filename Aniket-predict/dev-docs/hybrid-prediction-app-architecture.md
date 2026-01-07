# HYBRID PREDICTION APP: Complete Architecture Deep-Dive

## Table of Contents
1. [System Overview](#system-overview)
2. [Microservices Architecture](#microservices-architecture)
3. [Frontend Layer](#frontend-layer)
4. [Backend Layer](#backend-layer)
5. [Data Processing Pipeline](#data-processing-pipeline)
6. [Prediction Engines](#prediction-engines)
7. [Database Architecture](#database-architecture)
8. [Real-Time Features](#real-time-features)
9. [Deployment & Scaling](#deployment--scaling)
10. [API Design](#api-design)

---

## System Overview

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────┬──────────────────┬──────────────────┤
│  Mobile App (RN)    │  Web App (React) │  Admin Dashboard  │
│  (iOS/Android)      │  (SPA)           │  (Analytics)      │
└──────────┬──────────┴──────────┬───────┴──────────┬────────┘
           │                     │                  │
           └─────────────────────┼──────────────────┘
                 API Gateway (Rate Limit, Auth)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │Auth Svc  │  │User Svc  │  │Data Svc  │
   └──────────┘  └──────────┘  └──────────┘
        │
        ▼
   ┌──────────────────────────────────────┐
   │   PREDICTION ENGINE LAYER            │
   ├──────────────┬──────────────────────┤
   │ Astrology    │ Behavior Analytics   │
   │ Engine       │ Engine               │
   │ (Rule-based) │ (ML-based)           │
   └──────────┬───┴──────────────────────┘
              │
   ┌──────────┴─────────────────┐
   │                            │
   ▼                            ▼
┌─────────────┐          ┌──────────────┐
│Batch Layer  │          │Streaming     │
│(Daily Jobs) │          │Layer (Real   │
│             │          │-time)        │
└─────────────┘          └──────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────────┐   ┌─────────────┐
│TimescaleDB  │   │MongoDB      │
│(Metrics)    │   │(Charts/     │
│             │   │Predictions) │
└─────────────┘   └─────────────┘
    │                    │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Redis Cache        │
    │ (Hot Data)         │
    └────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌───────────┐   ┌──────────┐
│ Analytics │   │ User API │
│ Dashboard │   │          │
└───────────┘   └──────────┘
```

---

## Microservices Architecture

### Service Decomposition

#### 1. **Authentication Service**
**Responsibility**: User signup, login, token management, OAuth integration
```yaml
Service: auth-service
Port: 3001
Tech Stack: Node.js + Express + JWT
Database: PostgreSQL (users table)

Endpoints:
  POST /auth/signup
  POST /auth/login
  POST /auth/refresh-token
  POST /auth/logout
  GET /auth/profile
  POST /auth/social-login (Google, Apple)
  POST /auth/two-factor-setup
  
Authentication Method:
  - JWT with 15min access token
  - Refresh token valid 30 days (stored in HttpOnly cookie)
  - Rate limiting: 5 attempts per 15 mins
```

#### 2. **User Profile Service**
**Responsibility**: User data management, preferences, subscriptions
```yaml
Service: user-service
Port: 3002
Tech Stack: Node.js + Express
Database: PostgreSQL + MongoDB

Core Functions:
  - Birth chart storage (encrypted)
  - User preferences (theme, language, notifications)
  - Subscription management
  - Profile analytics (login frequency, feature usage)
  - Family member profiles (for compatibility matching)

Endpoints:
  GET /users/:id/profile
  PUT /users/:id/profile
  POST /users/:id/family-members
  GET /users/:id/subscription-status
  PUT /users/:id/preferences
  
Data Schema:
  {
    userId: UUID,
    birthChart: {
      date: ISO8601,
      time: HH:mm:ss,
      location: { lat, lng, name },
      timezone: "Asia/Kolkata"
    },
    preferences: {
      language: "en|hi|ta",
      theme: "light|dark|auto",
      notifications: boolean,
      predictionFrequency: "daily|weekly"
    },
    subscription: {
      tier: "free|premium|pro",
      expiresAt: ISO8601,
      paymentMethod: "stripe_id"
    },
    createdAt: ISO8601,
    lastActiveAt: ISO8601
  }
```

#### 3. **Astrology Engine Service**
**Responsibility**: Birth chart calculations, horoscope generation, transit analysis
```yaml
Service: astrology-engine
Port: 3003
Tech Stack: Node.js + Python (for heavy calculations)
Dependencies: Swiss Ephemeris Library

Core Modules:
  1. Chart Calculator
     - Input: Birth date, time, location
     - Output: Complete Kundli with all divisional charts
     - Calculations: Lagna, Navamsha, Dasha periods
     
  2. Transit Analyzer
     - Current planetary positions
     - Aspects analysis
     - Favorable/unfavorable periods
     
  3. Dasha Period Manager
     - Vimshottari Dasha calculation
     - Antardasha breakdowns
     - Dasha lord positioning
     
  4. Yoga & Dosha Detector
     - Raj Yoga, Dhana Yoga, etc.
     - Mangal Dosha, Kaal Sarp Dosha
     - Remedies suggestion

Endpoints:
  POST /astrology/kundli (Create birth chart)
  GET /astrology/kundli/:userId
  POST /astrology/horoscope/daily
  GET /astrology/transit-analysis/:userId
  POST /astrology/dasha-periods/:userId
  GET /astrology/dosha-check/:userId
  POST /astrology/remedies-suggest/:userId
  
Example Response (Birth Chart):
  {
    kundliId: UUID,
    birthChart: {
      lagna: { sign: "Taurus", degree: 15.32 },
      sun: { sign: "Libra", degree: 12.45, house: 5 },
      moon: { sign: "Leo", degree: 28.12, house: 3 },
      // ... all 9 planets
    },
    divisionalCharts: {
      d9: { ... },    // Navamsha
      d10: { ... },   // Dashamsha
      d27: { ... }    // Nakshatramsha
    },
    currentDasha: {
      mahadasha: "Mercury",
      mahadashaStart: "2024-03-15",
      mahadashaEnd: "2041-03-15",
      antardasha: "Venus",
      antardashaStart: "2024-03-15",
      antardashaEnd: "2025-11-12"
    },
    yogas: ["Raj Yoga", "Gaja Kesari Yoga"],
    doshas: ["Mangal Dosha"],
    calculatedAt: ISO8601
  }
```

#### 4. **Behavior Analytics Engine**
**Responsibility**: ML predictions based on user behavior patterns
```yaml
Service: behavior-analytics
Port: 3004
Tech Stack: Python (Flask/FastAPI) + ML libraries (scikit-learn, Prophet, TensorFlow)
Database: TimescaleDB + MongoDB

Core ML Models:
  1. Time-Series Forecasting (Prophet)
     - Income prediction
     - Expense forecasting
     - Savings trajectory
     
  2. Stress/Health Prediction (LSTM)
     - Burnout risk detection
     - Sleep quality forecast
     - Health trend analysis
     
  3. Behavior Clustering (K-Means)
     - User segmentation
     - Pattern similarity matching
     - Peer comparison
     
  4. Relationship Pattern (NLP + Time-Series)
     - Relationship health score
     - Communication frequency analysis
     - Conflict prediction

Endpoints:
  POST /analytics/income-forecast/:userId
    Request: { timeframe: "3-6-12_months" }
    Response: {
      forecast: [
        { month: "Jan 2026", predicted: 85000, confidence: 0.85 },
        // ...
      ],
      trend: "upward",
      seasonality: { peak: "March-April", low: "August" }
    }
    
  POST /analytics/health-risk/:userId
    Response: {
      burnoutRisk: 0.72,
      sleepQualityTrend: "declining",
      stressLevel: "high",
      recommendations: ["Take 3-day break", "Increase exercise"]
    }
    
  POST /analytics/relationship-health/:userId
    Response: {
      healthScore: 7.5/10,
      communicationFrequency: "3x weekly",
      conflictPattern: "weekend peaks",
      compatibilityCluster: "high"
    }

Data Collection:
  - Passive: Bank API (Plaid), Google Fit, Calendar
  - Active: Daily mood, manual expense entry, relationship ratings
```

#### 5. **Prediction Service**
**Responsibility**: Hybrid predictions combining astrology + analytics
```yaml
Service: prediction-service
Port: 3005
Tech Stack: Node.js + Python (model serving)
Database: MongoDB (cache predictions)

Functions:
  1. Hybrid Prediction Engine
     - Fetch astrology predictions
     - Fetch behavior predictions
     - Combine with confidence scoring
     - Generate actionable insights
     
  2. Confidence Scoring Algorithm
     ```
     confidence = (astrology_confidence * 0.3) + 
                  (behavior_confidence * 0.7) +
                  (alignment_bonus * 0.2)
     
     where alignment_bonus = 0.2 if both systems agree
                           = -0.1 if they disagree
     ```

Endpoints:
  POST /predictions/career/:userId
    Response: {
      astrology: {
        period: "June-Aug 2026",
        favorability: "high",
        keyFactors: ["Jupiter 10th", "Mercury Dasha"],
        confidence: 0.65
      },
      behavior: {
        growthProbability: 0.78,
        keyFactors: ["Upskilling trend", "Performance increase"],
        confidence: 0.82,
        similarUsers: {
          advanced: 127,
          achieved: 91,
          successRate: "71.7%"
        }
      },
      combined: {
        overallConfidence: 0.75,
        recommendation: "High probability of advancement",
        actionItems: ["Apply for senior roles June-Aug"],
        riskFactors: ["Burnout potential if overworked"]
      }
    }
    
  POST /predictions/health/:userId
  POST /predictions/finance/:userId
  POST /predictions/relationship/:userId
  GET /predictions/timeline/:userId?months=12
```

#### 6. **Real-Time Consultation Service**
**Responsibility**: Live astrologer-user connections, video/chat
```yaml
Service: consultation-service
Port: 3006
Tech Stack: Node.js + Socket.io + WebRTC (Agora/Twilio)
Database: PostgreSQL (booking) + MongoDB (chat history)

Features:
  - Live video/audio calls
  - Chat messaging with end-to-end encryption
  - Screen sharing for chart analysis
  - Call recording (with consent)
  - Auto call-end with payment processing

Endpoints:
  POST /consultations/book
    Request: {
      astrologerId: UUID,
      durationMinutes: 30,
      type: "video|audio|chat"
    }
  
  POST /consultations/:id/start
  POST /consultations/:id/end
  GET /consultations/history/:userId
  
WebSocket Events:
  call:initiated
  call:answered
  call:declined
  message:sent
  call:recording-started
  call:ended
```

#### 7. **Payment & Subscription Service**
**Responsibility**: Billing, subscription management, payment processing
```yaml
Service: payment-service
Port: 3007
Tech Stack: Node.js + Stripe/Razorpay
Database: PostgreSQL

Features:
  - Subscription billing (monthly/annual)
  - One-time purchases (reports, consultations)
  - In-app wallet
  - Refund handling
  - Invoice generation
  - Revenue sharing with astrologers (70-30 split)

Endpoints:
  POST /payments/subscription/create
  POST /payments/subscription/upgrade
  POST /payments/subscription/cancel
  GET /payments/invoices/:userId
  POST /payments/wallet/topup
  POST /payments/transaction/refund
  GET /payments/astrologer/earnings/:astrologerId
```

#### 8. **Notification Service**
**Responsibility**: Push notifications, email alerts, SMS reminders
```yaml
Service: notification-service
Port: 3008
Tech Stack: Node.js + Firebase Cloud Messaging + SendGrid
Queue: Redis/RabbitMQ

Notification Types:
  1. Daily Horoscope
     Scheduled: 6 AM user's timezone
     Content: Personalized daily forecast
     
  2. Important Transit Alerts
     Triggered: When major transit occurs
     Content: Jupiter/Saturn transit alerts
     
  3. Prediction Milestones
     Triggered: When forecast period arrives
     Content: "Your career forecast period starts tomorrow"
     
  4. Astrologer Availability
     Triggered: When favorite astrologer comes online
     Content: "Dr. Smith is now available for consultation"
     
  5. Health/Stress Alerts
     Triggered: When stress/health metrics spike
     Content: "ML detected rising stress - take a break?"
     
  6. Financial Milestones
     Triggered: Monthly or when spending thresholds crossed
     Content: "You've saved ₹15K more than forecasted"

Channels:
  - Push notification (mobile)
  - Email (daily digest)
  - SMS (urgent alerts only)
  - In-app badge/notification

Rate Limiting:
  - Max 3 notifications per day for free users
  - Max 10 for premium users
  - User can snooze notifications 1-7 days
```

#### 9. **Admin & Analytics Service**
**Responsibility**: System monitoring, user analytics, revenue tracking
```yaml
Service: admin-service
Port: 3009
Tech Stack: Node.js + Analytics Dashboard (Metabase/Grafana)
Database: MongoDB (analytics), InfluxDB (metrics)

Admin Dashboards:
  1. User Metrics
     - Total users (daily/monthly/annual)
     - Active users, retention rate
     - Churn analysis
     - Geographic distribution
     
  2. Revenue Metrics
     - MRR (Monthly Recurring Revenue)
     - Subscription breakdown (free/premium/pro)
     - Consultation revenue
     - E-commerce sales
     
  3. System Health
     - API response times
     - Error rates by service
     - Database query performance
     - Cache hit rates
     
  4. Astrologer Management
     - Earnings per astrologer
     - Rating/review tracking
     - Consultation completion rate
     - New astrologer onboarding
```

---

## Frontend Layer

### Mobile App Architecture (React Native)

```javascript
// Directory Structure
mobile/
├── src/
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── BirthDetailsScreen.tsx
│   │   │   ├── AstrologyOnboardingScreen.tsx
│   │   │   └── DataAccessScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── PredictionDetailScreen.tsx
│   │   │   └── TimelineScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── SubscriptionScreen.tsx
│   │   │   └── PreferencesScreen.tsx
│   │   ├── astrology/
│   │   │   ├── KundliScreen.tsx
│   │   │   ├── HoroscopeScreen.tsx
│   │   │   ├── DashaScreen.tsx
│   │   │   └── TransitAnalysisScreen.tsx
│   │   ├── analytics/
│   │   │   ├── IncomeScreen.tsx
│   │   │   ├── HealthScreen.tsx
│   │   │   ├── RelationshipScreen.tsx
│   │   │   └── FinanceScreen.tsx
│   │   ├── consultation/
│   │   │   ├── AstrologerListScreen.tsx
│   │   │   ├── BookingScreen.tsx
│   │   │   ├── VideoCallScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   └── marketplace/
│   │       ├── GemstoneScreen.tsx
│   │       ├── RemediesScreen.tsx
│   │       └── CartScreen.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── prediction/
│   │   │   ├── PredictionCard.tsx
│   │   │   ├── ConfidenceScoreIndicator.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   └── HybridPredictionPanel.tsx
│   │   ├── astrology/
│   │   │   ├── ChartRenderer.tsx
│   │   │   ├── PlanetPositions.tsx
│   │   │   ├── HouseSystem.tsx
│   │   │   └── DashaTimeline.tsx
│   │   └── analytics/
│   │       ├── TrendChart.tsx
│   │       ├── ForecastGraph.tsx
│   │       ├── MetricCard.tsx
│   │       └── ComparisonChart.tsx
│   │
│   ├── services/
│   │   ├── api.ts (API client)
│   │   ├── auth.ts (Authentication)
│   │   ├── storage.ts (Local storage)
│   │   ├── analytics.ts (Event tracking)
│   │   └── websocket.ts (Real-time updates)
│   │
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── predictionSlice.ts
│   │   │   └── astrologySlice.ts
│   │   └── store.ts
│   │
│   └── styles/
│       ├── theme.ts
│       ├── colors.ts
│       └── typography.ts
│
└── app.json (Expo config)
```

### Key UI Components

```typescript
// Hybrid Prediction Card Component
interface HybridPredictionCardProps {
  category: 'career' | 'health' | 'finance' | 'relationship';
  astrology: Astrological Prediction;
  behavior: BehaviorPrediction;
  combined: CombinedPrediction;
}

export const HybridPredictionCard: React.FC<HybridPredictionCardProps> = ({
  category,
  astrology,
  behavior,
  combined
}) => {
  const confidenceColor = getConfidenceColor(combined.confidence);
  
  return (
    <Card>
      <CardHeader>
        <Title>{category.toUpperCase()} FORECAST</Title>
        <ConfidenceScore value={combined.confidence} />
      </CardHeader>
      
      <CardBody>
        {/* Astrology Layer */}
        <PredictionSection title="✨ Astrological Insight">
          <Text>{astrology.insight}</Text>
          <PlanetaryFactors factors={astrology.keyFactors} />
          <ConfidenceBar value={astrology.confidence} label="Astrological Confidence" />
        </PredictionSection>
        
        {/* Behavior Analytics Layer */}
        <PredictionSection title="📊 Data-Driven Analysis">
          <Text>{behavior.insight}</Text>
          <TrendIndicator trend={behavior.trend} />
          <DataPoints points={behavior.keyFactors} />
          <ConfidenceBar value={behavior.confidence} label="AI Confidence" />
        </PredictionSection>
        
        {/* Combined Prediction */}
        <PredictionSection title="🎯 Combined Forecast">
          <RecommendationBox recommendation={combined.recommendation} />
          <ActionItems items={combined.actionItems} />
          <RiskFactors risks={combined.riskFactors} />
        </PredictionSection>
      </CardBody>
    </Card>
  );
};
```

### State Management (Redux)

```typescript
// Redux Store Structure
interface AppState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
  };
  
  user: {
    profile: UserProfile | null;
    birthChart: KundliData | null;
    preferences: UserPreferences;
    familyMembers: FamilyMember[];
  };
  
  predictions: {
    careerForecast: PredictionSet | null;
    healthForecast: PredictionSet | null;
    financeForecast: PredictionSet | null;
    relationshipForecast: PredictionSet | null;
    loading: boolean;
    error: string | null;
  };
  
  astrology: {
    kundli: KundliData | null;
    dailyHoroscope: Horoscope | null;
    transits: Transit[];
    dashaInfo: DashaInfo | null;
  };
  
  ui: {
    theme: 'light' | 'dark';
    language: string;
    bottomTabIndex: number;
  };
}
```

### Web App Architecture (React SPA)

```typescript
// Web app uses same API but optimized for desktop
web/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── PredictionDetail.tsx
│   │   ├── ProfileSettings.tsx
│   │   ├── AstrologyCharts.tsx
│   │   ├── ConsultationBooking.tsx
│   │   └── Analytics.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── DetailedChartRenderer.tsx
│   │   └── AdvancedAnalyticsPanel.tsx
│   └── hooks/
│       ├── usePredictions.ts
│       ├── useAstrology.ts
│       └── useAnalytics.ts
```

---

## Backend Layer

### API Gateway Architecture

```yaml
API Gateway (Kong/AWS API Gateway)
├── Rate Limiting:
│   ├── Free tier: 100 requests/hour
│   ├── Premium: 1000 requests/hour
│   └── Pro: Unlimited
│
├── Authentication:
│   ├── JWT validation
│   ├── OAuth2 support
│   └── Refresh token handling
│
├── Request Routing:
│   ├── /auth/* → auth-service:3001
│   ├── /users/* → user-service:3002
│   ├── /astrology/* → astrology-engine:3003
│   ├── /analytics/* → behavior-analytics:3004
│   ├── /predictions/* → prediction-service:3005
│   ├── /consultations/* → consultation-service:3006
│   ├── /payments/* → payment-service:3007
│   ├── /notifications/* → notification-service:3008
│   └── /admin/* → admin-service:3009
│
├── Request Logging:
│   └── ELK Stack (Elasticsearch, Logstash, Kibana)
│
└── Monitoring:
    ├── Prometheus (metrics)
    ├── Grafana (visualization)
    └── DataDog (APM)
```

### Service Communication

```typescript
// Service-to-Service Communication Pattern

// Event-driven for async operations
// Using RabbitMQ/Kafka for message queue

// Example: When user completes consultation booking
// Payment Service publishes event:
{
  type: "consultation.booked",
  data: {
    consultationId: UUID,
    userId: UUID,
    astrologerId: UUID,
    amount: 500,
    timestamp: ISO8601
  }
}

// Subscribed by:
// 1. Notification Service → Send confirmation
// 2. Analytics Service → Track revenue
// 3. Astrologer Service → Update availability
```

### Request/Response Examples

```typescript
// Career Prediction Request
POST /api/v1/predictions/career
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "userId": "user123",
  "timeframe": "6_months", // 1,3,6,12 months
  "includeAstrology": true,
  "includeBehavior": true,
  "includeRecommendations": true
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "predictionId": "pred_xyz",
    "category": "career",
    "timeframe": "6_months",
    "period": {
      "start": "2026-01-01",
      "end": "2026-06-30"
    },
    "astrology": {
      "favorability": "high",
      "keyFactors": [
        {
          "planet": "Jupiter",
          "house": 10,
          "aspect": "conjunction_sun",
          "period": "June-August 2026",
          "influence": "positive"
        }
      ],
      "dashaInfo": {
        "current": {
          "period": "Mercury Mahadasha",
          "lord": "Mercury",
          "startDate": "2024-03-15",
          "endDate": "2041-03-15"
        },
        "subperiod": {
          "period": "Venus Antardasha",
          "startDate": "2024-03-15",
          "endDate": "2025-11-12"
        }
      },
      "prediction": "Jupiter's transit through your 10th house of career is highly favorable for promotions and new opportunities. Mercury Mahadasha supports communication and negotiations.",
      "confidence": 0.68,
      "accuracyFactors": {
        "birthTimeAccuracy": "exact", // based on user input
        "kundliStrength": "strong",
        "transitsClarity": "clear"
      }
    },
    "behavior": {
      "growthMetrics": {
        "skillDevelopment": {
          "value": "3 certifications in 6 months",
          "trend": "accelerating",
          "comparison": "top 15% of similar users"
        },
        "performanceScore": {
          "value": 8.2,
          "trend": "up 12% from last period",
          "components": {
            "taskCompletion": 0.92,
            "qualityScore": 0.78,
            "timeManagement": 0.81
          }
        },
        "marketVisibility": {
          "linkedInViews": "up 40%",
          "profileUpdates": "recent",
          "endorsements": "increasing"
        }
      },
      "prediction": "Your upskilling trend, improving performance metrics, and increased market visibility show strong trajectory for career advancement. Historical data shows similar users achieve 71% success rate in promotions within this 6-month window.",
      "probability": 0.78,
      "confidence": 0.85,
      "similarUserOutcomes": {
        "totalSimilar": 247,
        "advanced": 176,
        "stagnant": 71,
        "declined": 0,
        "successRate": 0.712
      }
    },
    "combined": {
      "recommendation": "VERY HIGH OPPORTUNITY - Both systems strongly align",
      "overallProbability": 0.74, // Average of astro & behavior
      "agreement": "strong", // Both systems agree
      "recommendation": "Apply for senior/leadership roles during June-August 2026. Request performance review before June.",
      "actionItems": [
        {
          "action": "Apply for senior roles",
          "timing": "June-August 2026",
          "priority": "high",
          "reason": "Jupiter transit + upskilling trend align"
        },
        {
          "action": "Request performance review",
          "timing": "May 2026",
          "priority": "high",
          "reason": "Document improvements before peak opportunity"
        },
        {
          "action": "Network proactively",
          "timing": "April-May 2026",
          "priority": "medium",
          "reason": "Mercury Dasha favors communication"
        }
      ],
      "riskFactors": [
        {
          "risk": "Burnout potential",
          "level": "medium",
          "indicator": "Work hours increasing",
          "mitigation": "Schedule planned rest; avoid overcommitting"
        },
        {
          "risk": "Overconfidence",
          "level": "low",
          "indicator": "High success indicators may inflate expectations",
          "mitigation": "Balance optimism with realistic planning"
        }
      ],
      "timelineVisualization": {
        "months": [
          {
            "month": "January 2026",
            "phase": "Preparation",
            "actions": ["Skill assessment", "Resume update"],
            "astrologyNote": "Mercury favorable"
          },
          {
            "month": "June 2026",
            "phase": "Action",
            "actions": ["Apply for roles", "Interviews"],
            "astrologyNote": "Jupiter enters 10th house - PEAK PERIOD"
          },
          // ... through December
        ]
      }
    },
    "dataQuality": {
      "astrologyDataCompleteness": "100%",
      "behaviorDataPoints": 342,
      "timeSeriesLength": "8 months",
      "modelTrainingData": "70M+ similar users"
    },
    "disclaimer": "This prediction is based on astrological principles and statistical analysis of historical data. Actual outcomes depend on individual effort, external circumstances, and free will. Not a guarantee of future results.",
    "generatedAt": "2025-12-20T10:30:00Z",
    "expiresAt": "2026-01-20T10:30:00Z" // Refresh monthly
  }
}
```

---

## Data Processing Pipeline

### Lambda Architecture (Batch + Streaming)

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA INGESTION LAYER                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  User Activities:                                           │
│  - Manual logging (expenses, mood, exercise)               │
│  - API integrations (bank, health, calendar)               │
│  - App events (button clicks, screen views)                │
│                                                             │
└──────────────┬──────────────────────────────────────────────┘
               │
        ┌──────┴────────┐
        │               │
        ▼               ▼
   ┌─────────┐    ┌──────────┐
   │ Batch   │    │ Streaming│
   │ Layer   │    │ Layer    │
   │         │    │ (Kafka)  │
   └────┬────┘    └────┬─────┘
        │              │
   (Hourly)      (Real-time)
        │              │
        ▼              ▼
   ┌─────────────────────┐
   │  ML Model Training  │
   │  & Prediction       │
   │                     │
   │  - Prophet (Forecasting)
   │  - LSTM (Sequences)
   │  - XGBoost (Classif)
   │  - K-Means (Clustering)
   └──────────┬──────────┘
              │
        ┌─────┴──────┐
        │            │
        ▼            ▼
   ┌─────────┐  ┌──────────┐
   │ Cache   │  │ Database │
   │(Redis)  │  │(MongoDB) │
   └────┬────┘  └────┬─────┘
        │            │
        └────┬───────┘
             │
             ▼
        ┌─────────────┐
        │ User API    │
        │ (Real-time) │
        └─────────────┘
```

### Batch Processing Pipeline

```python
# Daily batch job (runs at 2 AM UTC)
import airflow
from airflow import DAG
from datetime import datetime, timedelta

default_args = {
    'owner': 'prediction-team',
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

with DAG('daily_prediction_pipeline',
         default_args=default_args,
         schedule_interval='0 2 * * *') as dag:
    
    # Task 1: Extract data from multiple sources
    extract_task = PythonOperator(
        task_id='extract_user_data',
        python_callable=extract_data_from_sources,
        op_args=['timescaledb', 'mongodb', 'plaid_api']
    )
    
    # Task 2: Feature engineering
    feature_task = PythonOperator(
        task_id='feature_engineering',
        python_callable=engineer_features,
        # Calculate moving averages, seasonality, anomalies
    )
    
    # Task 3: Model predictions (parallel for each user segment)
    predict_task = PythonOperator(
        task_id='ml_predictions',
        python_callable=generate_predictions,
        # Income forecast, health risk, stress prediction
        pool='ml_pool', # Limit concurrent ML jobs
        pool_slots=5
    )
    
    # Task 4: Cache results
    cache_task = PythonOperator(
        task_id='cache_results',
        python_callable=cache_predictions_redis
    )
    
    # Task 5: Generate notifications
    notify_task = PythonOperator(
        task_id='send_notifications',
        python_callable=trigger_notification_service
    )
    
    extract_task >> feature_task >> predict_task >> cache_task >> notify_task
```

### Real-Time Streaming Pipeline

```python
# Apache Kafka streaming for real-time updates
from kafka import KafkaConsumer
from datetime import datetime
import json

class RealTimePredictionStream:
    def __init__(self):
        self.consumer = KafkaConsumer(
            'user-events',
            bootstrap_servers=['kafka:9092'],
            group_id='prediction-group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        self.redis_cache = redis.Redis(host='redis', port=6379)
    
    def process_event(self, event):
        """Process user event in real-time"""
        userId = event['userId']
        eventType = event['type']
        
        if eventType == 'expense_logged':
            # Update income forecast incrementally
            current_forecast = self.redis_cache.get(f'forecast:income:{userId}')
            updated_forecast = self.update_prophet_model_online(
                current_forecast,
                event['amount']
            )
            self.redis_cache.set(
                f'forecast:income:{userId}',
                updated_forecast,
                ex=86400  # Expires in 24 hours
            )
        
        elif eventType == 'mood_logged':
            # Update stress prediction
            self.update_stress_classifier(userId, event['mood_score'])
        
        elif eventType == 'workout_completed':
            # Update health trajectory
            self.update_health_metrics(userId, event['duration'], event['intensity'])
    
    def start(self):
        for message in self.consumer:
            try:
                self.process_event(message.value)
            except Exception as e:
                logger.error(f"Error processing event: {e}")
```

---

## Prediction Engines

### Astrology Calculation Engine

```python
# Swiss Ephemeris based calculations
import ephem
from datetime import datetime, timezone

class AstrologyCalculator:
    def __init__(self):
        self.ephem = ephem
        
    def calculate_birth_chart(self, birth_datetime, latitude, longitude):
        """Calculate complete birth chart"""
        
        observer = ephem.Observer()
        observer.lat = str(latitude)
        observer.lon = str(longitude)
        observer.date = birth_datetime
        
        planets = {
            'sun': ephem.Sun(observer),
            'moon': ephem.Moon(observer),
            'mercury': ephem.Mercury(observer),
            'venus': ephem.Venus(observer),
            'mars': ephem.Mars(observer),
            'jupiter': ephem.Jupiter(observer),
            'saturn': ephem.Saturn(observer),
            'rahu': self.calculate_rahu(birth_datetime),  # Node
            'ketu': self.calculate_ketu(birth_datetime)   # Node
        }
        
        # Convert to zodiacal positions
        chart = {
            'planets': {},
            'houses': self.calculate_houses(observer),
            'ascendant': self.calculate_ascendant(observer),
            'divisional_charts': {}
        }
        
        for planet, position in planets.items():
            chart['planets'][planet] = {
                'sign': self.get_zodiac_sign(position.ra),
                'degree': self.normalize_degree(position.ra),
                'house': self.get_house_placement(position, chart['houses']),
                'speed': self.calculate_planet_speed(planet, observer),
                'retrograde': self.is_retrograde(planet, observer)
            }
        
        return chart
    
    def calculate_dasha_periods(self, birth_chart, current_date):
        """Vimshottari Dasha calculation"""
        moon_nakshatra = birth_chart['planets']['moon']['nakshatra']
        
        # Fixed Dasha durations (in years)
        dasha_years = {
            'Sun': 6, 'Moon': 10, 'Mars': 7,
            'Mercury': 17, 'Jupiter': 16, 'Venus': 20,
            'Saturn': 19, 'Rahu': 18, 'Ketu': 7
        }
        
        # Calculate remaining years in current Dasha
        # based on moon's position in Nakshatra
        
        dasha_sequence = [
            'Moon', 'Mars', 'Mercury', 'Jupiter', 'Saturn',
            'Mercury', 'Ketu', 'Venus', 'Sun'  # 9 Dashas
        ]
        
        return {
            'current': self.get_current_dasha(moon_nakshatra, current_date),
            'sequence_for_120_years': dasha_sequence,
            'forecast': self.project_dasha_periods(current_date)
        }
    
    def analyze_transits(self, current_date, natal_chart):
        """Analyze current planetary transits"""
        observer = ephem.Observer()
        observer.date = current_date
        
        transits = {}
        for planet_name in ['Jupiter', 'Saturn', 'Mars']:
            transit_pos = getattr(ephem, planet_name)(observer)
            natal_pos = self.get_natal_position(planet_name, natal_chart)
            
            transits[planet_name] = {
                'current_sign': self.get_zodiac_sign(transit_pos.ra),
                'natal_sign': natal_pos['sign'],
                'aspects': self.calculate_aspects(transit_pos, natal_chart),
                'house': self.get_house_placement(transit_pos, natal_chart['houses']),
                'influence': self.determine_influence(planet_name, transits)
            }
        
        return transits
    
    def detect_doshas(self, birth_chart):
        """Detect inauspicious combinations"""
        doshas = []
        
        # Mangal Dosha detection
        mars = birth_chart['planets']['mars']
        dosha_houses = [1, 2, 4, 7, 8, 12]
        
        if mars['house'] in dosha_houses:
            doshas.append({
                'name': 'Mangal Dosha',
                'severity': 'high',
                'description': 'Mars in inauspicious house',
                'remedies': ['Wear coral gemstone', 'Recite Hanuman Chalisa']
            })
        
        # Kaal Sarp Dosha detection (Rahu-Ketu conjunction)
        rahu_house = birth_chart['planets']['rahu']['house']
        ketu_house = birth_chart['planets']['ketu']['house']
        
        if self.are_opposite_houses(rahu_house, ketu_house):
            doshas.append({
                'name': 'Kaal Sarp Dosha',
                'severity': 'medium',
                'description': 'Rahu-Ketu axis along nodal axis'
            })
        
        return doshas
    
    def generate_horoscope(self, birth_chart, current_date, duration='daily'):
        """Generate personalized horoscope"""
        
        user_sign = birth_chart['ascendant']['sign']
        current_transits = self.analyze_transits(current_date, birth_chart)
        
        horoscope_text = f"""
        🌙 Horoscope for {user_sign} 
        
        {self.get_transit_interpretation(current_transits, user_sign)}
        
        Favorable: {self.get_favorable_activities(current_transits)}
        Avoid: {self.get_avoid_activities(current_transits)}
        
        Lucky Time: {self.calculate_auspicious_time()}
        """
        
        return horoscope_text
```

### ML-Based Behavior Analytics

```python
# ML prediction models
import pandas as pd
import numpy as np
from statsmodels.tsa.prophet.prophet import Prophet
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import tensorflow as tf
from tensorflow.keras.models import LSTM

class BehaviorAnalyticsEngine:
    def __init__(self):
        self.prophet_models = {}
        self.lstm_models = {}
        self.scaler = StandardScaler()
    
    def income_forecast(self, user_id, historical_data, months_ahead=6):
        """Time-series forecasting with Prophet"""
        
        # Prepare data
        df = pd.DataFrame({
            'ds': historical_data['dates'],
            'y': historical_data['income']
        })
        
        # Initialize and fit Prophet
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            interval_width=0.95,
            seasonality_mode='additive'
        )
        model.fit(df)
        
        # Make forecast
        future = model.make_future_dataframe(periods=months_ahead * 30)
        forecast = model.predict(future)
        
        return {
            'forecast': forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(months_ahead * 30),
            'trend': 'upward' if forecast['trend'].iloc[-1] > forecast['trend'].iloc[0] else 'downward',
            'seasonality': self.extract_seasonality(model)
        }
    
    def stress_prediction(self, user_id, metrics_history):
        """LSTM-based stress level prediction"""
        
        # Prepare sequences
        X, y = self.prepare_sequences(
            metrics_history['work_hours'],
            metrics_history['sleep_hours'],
            metrics_history['mood_scores'],
            sequence_length=7
        )
        
        # Load pre-trained LSTM model
        model = self.load_model('stress_lstm_model')
        
        # Predict next 30 days
        predictions = []
        for day in range(30):
            stress_level = model.predict(X[-1:])
            predictions.append(stress_level[0][0])
            
            # Slide window
            X = np.roll(X, -1, axis=1)
            X[0, -1] = stress_level[0]
        
        return {
            'predictions': predictions,
            'trend': np.polyfit(range(30), predictions, 1)[0],  # Slope
            'risk_days': [i for i, s in enumerate(predictions) if s > 0.7],
            'recommendations': self.get_stress_recommendations(predictions)
        }
    
    def health_trajectory(self, user_id, health_metrics):
        """Predict future health based on current trajectory"""
        
        # Combine multiple health indicators
        sleep_trend = self.calculate_trend(health_metrics['sleep'])
        exercise_trend = self.calculate_trend(health_metrics['exercise'])
        diet_trend = self.calculate_trend(health_metrics['diet_score'])
        
        # Use ensemble: Random Forest for classification
        clf = RandomForestClassifier(n_estimators=100)
        
        # Features: sleep, exercise, diet, stress, age, gender
        features = self.extract_health_features(user_id, health_metrics)
        
        # Predict health risk categories
        risk_predictions = clf.predict_proba(features)
        
        return {
            'health_risk_6m': risk_predictions[0][1],  # Probability of health issue
            'sleep_quality_trend': sleep_trend,
            'fitness_trajectory': exercise_trend,
            'weight_prediction': self.predict_weight_change(health_metrics),
            'recommendations': self.get_health_recommendations(health_metrics)
        }
    
    def relationship_compatibility_score(self, user1_id, user2_id):
        """AI-based relationship compatibility beyond astrology"""
        
        # Get user behavior patterns
        user1_patterns = self.extract_behavioral_patterns(user1_id)
        user2_patterns = self.extract_behavioral_patterns(user2_id)
        
        # Calculate similarity across dimensions
        similarities = {
            'communication_frequency': self.cosine_similarity(
                user1_patterns['communication'],
                user2_patterns['communication']
            ),
            'lifestyle_alignment': self.calculate_lifestyle_match(
                user1_patterns, user2_patterns
            ),
            'values_alignment': self.nlp_values_match(
                user1_patterns['journal_entries'],
                user2_patterns['journal_entries']
            ),
            'conflict_style_compatibility': self.analyze_conflict_patterns(
                user1_patterns, user2_patterns
            )
        }
        
        # Weighted average
        weights = {
            'communication_frequency': 0.25,
            'lifestyle_alignment': 0.25,
            'values_alignment': 0.30,
            'conflict_style_compatibility': 0.20
        }
        
        overall_score = sum(
            similarities[key] * weights[key]
            for key in similarities.keys()
        )
        
        return {
            'overall_compatibility': overall_score,
            'breakdown': similarities,
            'success_probability': self.historical_success_rate(
                overall_score,
                similar_couples_data
            )
        }
```

---

## Database Architecture

### Polyglot Persistence Strategy

```yaml
Database Layer:
  ├── PostgreSQL (Primary Relational DB)
  │   ├── Users table (auth, profile)
  │   ├── Subscriptions table
  │   ├── Consultations table (bookings)
  │   ├── Transactions table (payments)
  │   └── Astrologer profiles table
  │
  ├── TimescaleDB (Time-Series Data)
  │   ├── User metrics (hourly)
  │   │   └── income, expenses, mood, stress, sleep
  │   ├── System metrics (every 10 seconds)
  │   │   └── API latency, error rates, requests/sec
  │   └── Prediction accuracy tracking
  │
  ├── MongoDB (NoSQL for Flexibility)
  │   ├── Birth charts collection
  │   ├── Predictions collection (cached)
  │   ├── User behavior logs
  │   ├── Articles & content
  │   └── Chat messages
  │
  ├── Redis (Caching & Sessions)
  │   ├── User sessions (TTL: 30 days)
  │   ├── Cached predictions (TTL: 24 hours)
  │   ├── Rate limit counters (TTL: 1 hour)
  │   ├── Leaderboards (updated daily)
  │   └── Real-time notifications queue
  │
  ├── Elasticsearch (Full-Text Search & Analytics)
  │   ├── Astrologer profiles (searchable)
  │   ├── Articles (for discovery)
  │   ├── User activity logs (for analytics)
  │   └── Support tickets (for search)
  │
  └── InfluxDB (Metrics & Monitoring)
      ├── Application performance metrics
      ├── Business metrics (DAU, MRR, etc.)
      ├── User engagement metrics
      └── System health metrics
```

### Data Schema Examples

```sql
-- PostgreSQL Schema

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender ENUM('M', 'F', 'Other'),
  birth_date DATE,
  
  -- Birth Chart (encrypted)
  birth_time TIME,
  birth_location_lat DECIMAL(10, 8),
  birth_location_lng DECIMAL(11, 8),
  birth_location_name VARCHAR(255),
  birth_timezone VARCHAR(50),
  birth_chart_id UUID REFERENCES birth_charts(id),
  
  -- Subscription
  subscription_tier ENUM('free', 'premium', 'pro'),
  subscription_start_date DATE,
  subscription_end_date DATE,
  
  -- Settings
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(10) DEFAULT 'light',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP  -- Soft delete
);

CREATE TABLE birth_charts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Planetary Positions (stored as JSON for flexibility)
  planets JSONB,  -- { sun: {sign, degree, house}, ... }
  
  -- Divisional Charts
  divisional_charts JSONB,  -- { d9: {...}, d10: {...}, ... }
  
  -- Dasha Information
  current_dasha JSONB,
  dasha_sequence JSONB,
  
  -- Analysis Results
  yogas JSONB,  -- Auspicious combinations
  doshas JSONB,  -- Inauspicious combinations
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  verified_at TIMESTAMP  -- When astrologer verified
);

CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  astrologer_id UUID NOT NULL REFERENCES users(id),
  
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
  
  consultation_type ENUM('video', 'audio', 'chat'),
  duration_minutes INTEGER,
  
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  amount_charged DECIMAL(10, 2),
  currency CHAR(3) DEFAULT 'INR',
  payment_status ENUM('pending', 'completed', 'refunded'),
  
  -- Encrypted fields
  call_recording_url VARCHAR(500),  -- S3 URL
  
  notes TEXT,  -- User can add notes after consultation
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE user_metrics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  
  metric_type VARCHAR(50),  -- 'income', 'expense', 'mood', 'sleep'
  metric_date DATE,
  metric_value DECIMAL(10, 2),
  
  -- Additional context
  category VARCHAR(100),  -- For expenses: 'food', 'travel', etc.
  notes TEXT,
  
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX (user_id, metric_date),
  INDEX (metric_type, metric_date)
);

CREATE TABLE predictions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  
  prediction_category ENUM('career', 'health', 'finance', 'relationship'),
  prediction_type ENUM('astrology', 'behavior', 'hybrid'),
  
  timeframe VARCHAR(50),  -- '1_month', '3_months', '6_months'
  period_start DATE,
  period_end DATE,
  
  -- Prediction Data (as JSON)
  astrology_prediction JSONB,
  behavior_prediction JSONB,
  combined_prediction JSONB,
  
  confidence_score DECIMAL(3, 2),  -- 0.0 to 1.0
  
  -- Tracking accuracy
  actual_outcome JSONB,  -- Recorded after period ends
  accuracy_score DECIMAL(3, 2),
  
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Real-Time Features

### WebSocket Architecture

```typescript
// Socket.io Implementation

import io from 'socket.io-client';

const socket = io('https://api.prediction-app.com', {
  auth: {
    token: jwt_token
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Event Listeners (Client-side)

// 1. Real-time prediction updates
socket.on('prediction:updated', (data) => {
  console.log('New prediction available:', data);
  // Update UI with new prediction
  dispatch(updatePrediction(data));
});

// 2. Transit alerts
socket.on('transit:alert', (data) => {
  console.log('Important transit happening:', data);
  // Show notification
  showNotification({
    title: data.title,
    body: data.description,
    priority: 'high'
  });
});

// 3. Consultation status updates
socket.on('consultation:status', (data) => {
  // Astrologer accepted, call starting, etc.
  updateConsultationStatus(data.status);
});

// 4. Real-time chat messages
socket.on('message:received', (message) => {
  addMessageToChat(message);
  playNotificationSound();
});

// 5. Leaderboard updates
socket.on('leaderboard:updated', (rankings) => {
  updateUserRanking(rankings);
});

// Event Emitters (Client to Server)

// Join real-time room for user
socket.emit('user:join', {
  userId: currentUser.id,
  room: 'user-predictions'
});

// Emit new metric for real-time processing
socket.emit('metric:logged', {
  type: 'expense',
  amount: 500,
  category: 'food',
  timestamp: Date.now()
});

// Answer consultation request
socket.emit('consultation:answer', {
  consultationId: id,
  response: 'accepted'
});

// Send chat message
socket.emit('message:send', {
  consultationId: id,
  text: 'Your career looks promising',
  timestamp: Date.now()
});
```

---

## Deployment & Scaling

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  # Frontend
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - api-gateway
  
  # Backend Services
  api-gateway:
    image: kong:3.0
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
    ports:
      - "8000:8000"
      - "8001:8001"
    depends_on:
      - postgres
      - auth-service
      - user-service
      - astrology-engine
      - behavior-analytics
  
  auth-service:
    build:
      context: ./services/auth
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/auth_db
      JWT_SECRET: dev-secret-key-change-in-prod
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  user-service:
    build:
      context: ./services/user
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/user_db
      MONGO_URL: mongodb://mongo:27017/user_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - mongo
      - redis
  
  astrology-engine:
    build:
      context: ./services/astrology
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      MONGO_URL: mongodb://mongo:27017/astrology_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - mongo
      - redis
  
  behavior-analytics:
    build:
      context: ./services/analytics
      dockerfile: Dockerfile
    ports:
      - "3004:3004"
    environment:
      TIMESCALE_URL: postgresql://user:password@timescaledb:5432/analytics_db
      MONGO_URL: mongodb://mongo:27017/analytics_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - timescaledb
      - mongo
      - redis
  
  # Databases
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: main_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: analytics_db
    volumes:
      - timescale_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
  
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
  
  # Message Queue
  kafka:
    image: confluentinc/cp-kafka:7.0.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
  
  zookeeper:
    image: confluentinc/cp-zookeeper:7.0.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

volumes:
  postgres_data:
  timescale_data:
  mongo_data:
  redis_data:
```

---

## API Design

### RESTful API Structure

```yaml
Base URL: https://api.prediction-app.com/v1

Authentication:
  - JWT Bearer token in Authorization header
  - Refresh token rotation every 15 days
  - OAuth2 for social login

Rate Limiting:
  - Free tier: 100 requests/hour
  - Premium: 1000 requests/hour
  - Pro: 10000 requests/hour
  - Headers: X-RateLimit-Limit, X-RateLimit-Remaining

Error Responses:
  400: Bad Request
  401: Unauthorized
  403: Forbidden
  404: Not Found
  429: Too Many Requests
  500: Internal Server Error
  
Response Format:
  {
    "success": boolean,
    "data": { ... } | null,
    "error": {
      "code": string,
      "message": string,
      "details": { ... } | null
    } | null,
    "meta": {
      "timestamp": ISO8601,
      "requestId": UUID,
      "version": "v1"
    }
  }
```

### Example Endpoints

```yaml
# User Management
POST   /auth/signup
POST   /auth/login
POST   /auth/refresh-token
POST   /auth/logout
GET    /users/me
PUT    /users/me
POST   /users/me/birth-chart
GET    /users/me/preferences
PUT    /users/me/preferences

# Predictions
POST   /predictions/career
POST   /predictions/health
POST   /predictions/finance
POST   /predictions/relationship
GET    /predictions/:id
GET    /predictions/history
GET    /predictions/timeline?months=12

# Astrology
GET    /astrology/kundli/:userId
POST   /astrology/horoscope/daily
GET    /astrology/transits/:userId
GET    /astrology/dasha/:userId
POST   /astrology/remedies/:userId

# Analytics
GET    /analytics/income-forecast/:userId
GET    /analytics/health-risk/:userId
GET    /analytics/relationship-health/:userId
GET    /analytics/financial-health/:userId

# Consultations
POST   /consultations/book
GET    /consultations/:id
POST   /consultations/:id/start
POST   /consultations/:id/end
GET    /consultations/history
GET    /astrologers?specialty=career&rating>=4.0

# Marketplace
GET    /marketplace/remedies
GET    /marketplace/gemstones
POST   /cart/add
POST   /orders/:id/checkout

# Payments
POST   /payments/subscription/create
POST   /payments/subscription/upgrade
GET    /payments/invoices
POST   /payments/wallet/topup

# Admin
GET    /admin/analytics/users
GET    /admin/analytics/revenue
GET    /admin/astrologers
PUT    /admin/astrologers/:id/approve
```

---

## Summary: Development Timeline & Cost

### Phase 1: MVP (Months 1-5)
**Focus**: Core functionality
- Birth chart generation
- Daily horoscope
- Basic behavior tracking
- Simple ML predictions
- Authentication & payments
- **Team**: 4-5 developers
- **Cost**: ₹30-40 lakhs ($3,600-$4,800)

### Phase 2: AI Integration (Months 6-9)
**Focus**: Advanced predictions
- Hybrid prediction engine
- LSTM models
- Real-time analytics
- Consultation bookings
- Marketplace
- **Team**: 6-7 developers + ML engineer
- **Cost**: ₹40-50 lakhs ($4,800-$6,000)

### Phase 3: Scale & Optimize (Months 10-12)
**Focus**: Performance & growth
- Microservices refactoring
- Kubernetes deployment
- Mobile app optimization
- Advanced analytics
- Community features
- **Team**: 8-10 developers
- **Cost**: ₹35-45 lakhs ($4,200-$5,400)

**Total**: 12 months, ₹105-135 lakhs ($12,600-$16,200)

---

## Technology Stack Summary

**Frontend**:
- React Native / Flutter (mobile)
- React.js (web)
- Redux (state management)
- D3.js / Chart.js (visualizations)

**Backend**:
- Node.js + Express (primary APIs)
- Python + FastAPI (ML services)
- Docker + Kubernetes (deployment)

**Databases**:
- PostgreSQL (relational)
- MongoDB (document store)
- TimescaleDB (time-series)
- Redis (caching)
- Elasticsearch (search)

**ML/AI**:
- Prophet (time-series forecasting)
- TensorFlow + LSTM (sequence prediction)
- Scikit-learn (classification)
- GPT-4/Claude (natural language)

**Infrastructure**:
- AWS / Google Cloud
- Kubernetes + Docker
- Kafka (message streaming)
- Firebase (push notifications)

**APIs & Integrations**:
- Swiss Ephemeris (astrology calculations)
- Stripe / Razorpay (payments)
- Plaid (bank integration)
- Google Fit / Apple HealthKit (health data)
- Agora / Twilio (real-time communication)

---

This comprehensive architecture provides a scalable, production-ready system for your hybrid prediction app combining astrology with AI-driven behavior analytics.
