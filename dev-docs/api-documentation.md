# Hybrid Prediction App - API Documentation

## Complete API Reference Guide

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Prediction APIs](#prediction-apis)
4. [Astrology APIs](#astrology-apis)
5. [Consultation APIs](#consultation-apis)
6. [Payment APIs](#payment-apis)
7. [Analytics APIs](#analytics-apis)
8. [Admin APIs](#admin-apis)

---

## Authentication APIs

### Base URL
```
https://api.prediction-app.com/v1
```

### Headers Required
```
Authorization: Bearer {access_token}
Content-Type: application/json
X-API-Version: v1
```

---

## 1. Authentication APIs

### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-12345",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "session": {
      "access_token": "eyJxxx...",
      "refresh_token": "eyJyyy...",
      "expires_in": 3600
    }
  }
}
```

---

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-12345",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "eyJxxx...",
      "refresh_token": "eyJyyy...",
      "expires_in": 3600
    }
  }
}
```

---

### OAuth Login
```http
POST /auth/oauth/{provider}
Content-Type: application/json

{
  "provider": "google",
  "id_token": "token_from_google",
  "redirect_uri": "https://myapp.com/callback"
}
```

**Supported Providers**: `google`, `apple`, `github`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  }
}
```

---

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJyyy..."
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJnew...",
    "expires_in": 3600
  }
}
```

---

### Setup MFA
```http
POST /auth/mfa/setup
Authorization: Bearer {access_token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,...",
    "secret": "JBSWY3DPEBLW64TMMQ...",
    "recovery_codes": ["code1", "code2", ...]
  }
}
```

---

### Verify MFA
```http
POST /auth/mfa/verify
Content-Type: application/json

{
  "access_token": "eyJxxx...",
  "mfa_code": "123456"
}
```

---

### Logout
```http
POST /auth/logout
Authorization: Bearer {access_token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 2. User Management APIs

### Get User Profile
```http
GET /users/me
Authorization: Bearer {access_token}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "uuid-12345",
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "gender": "M",
    "profile_image_url": "https://...",
    "subscription_tier": "premium",
    "subscription_start_date": "2025-01-01T00:00:00Z",
    "subscription_end_date": "2025-12-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update User Profile
```http
PUT /users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "gender": "M",
  "bio": "Astrology enthusiast"
}
```

---

### Upload Birth Chart
```http
POST /users/me/birth-chart
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "birth_date": "1990-05-15",
  "birth_time": "14:30:00",
  "birth_timezone": "Asia/Kolkata",
  "birth_location_name": "Mumbai, India",
  "birth_location_lat": 19.0760,
  "birth_location_lng": 72.8777
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "chart-uuid-123",
    "user_id": "user-uuid-123",
    "birth_chart": {
      "lagna": { "sign": "Taurus", "degree": 15.32 },
      "sun": { "sign": "Taurus", "degree": 12.45, "house": 1 },
      "moon": { "sign": "Scorpio", "degree": 28.12, "house": 8 },
      ... // all 9 planets
    },
    "divisional_charts": {
      "d9": { ... },
      "d10": { ... }
    },
    "yogas": ["Raj Yoga", "Gaja Kesari Yoga"],
    "doshas": ["Mangal Dosha"],
    "current_dasha": {
      "mahadasha": "Mercury",
      "antardasha": "Venus"
    }
  }
}
```

---

### Get Birth Chart
```http
GET /users/me/birth-chart
Authorization: Bearer {access_token}
```

---

### Get User Preferences
```http
GET /users/me/preferences
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "language": "en",
    "timezone": "Asia/Kolkata",
    "notifications_enabled": true,
    "email_predictions": true,
    "sms_alerts": false,
    "push_notifications": true,
    "prediction_frequency": "daily"
  }
}
```

---

### Update User Preferences
```http
PUT /users/me/preferences
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "theme": "dark",
  "language": "hi",
  "notifications_enabled": true,
  "prediction_frequency": "weekly"
}
```

---

## 3. Prediction APIs

### Generate New Prediction
```http
POST /predictions/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "category": "career",
  "timeframe": "6_months"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "pred-uuid-123",
    "user_id": "user-uuid-123",
    "category": "career",
    "prediction_type": "hybrid",
    "timeframe": "6_months",
    "period_start": "2025-12-20",
    "period_end": "2025-06-20",
    
    "astrology_prediction": {
      "favorability": "high",
      "key_factors": [
        {
          "planet": "Jupiter",
          "house": 10,
          "influence": "positive",
          "period": "Jun-Aug 2026"
        }
      ],
      "dashaInfo": {
        "current": "Mercury Mahadasha",
        "subPeriod": "Venus Antardasha"
      },
      "prediction": "Jupiter in 10th house brings career opportunities...",
      "confidence": 0.68
    },
    
    "behavior_prediction": {
      "growthMetrics": {
        "skillDevelopment": "3 certifications in 6 months",
        "performanceScore": 8.2,
        "marketVisibility": "up 40%"
      },
      "prediction": "Upskilling trend shows strong trajectory...",
      "probability": 0.78,
      "confidence": 0.85,
      "similarUserOutcomes": {
        "successRate": 0.712
      }
    },
    
    "combined_prediction": {
      "confidence": 0.74,
      "agreement": "strong",
      "recommendation": "VERY HIGH OPPORTUNITY - Apply for senior roles June-Aug",
      "actionItems": [
        {
          "action": "Apply for senior roles",
          "timing": "June-August 2026",
          "priority": "high"
        }
      ],
      "riskFactors": [
        {
          "risk": "Burnout potential",
          "level": "medium",
          "mitigation": "Schedule planned rest"
        }
      ]
    },
    
    "generated_at": "2025-12-20T10:30:00Z",
    "expires_at": "2026-01-20T10:30:00Z"
  }
}
```

---

### Get All Predictions
```http
GET /predictions?category=career&timeframe=6m&limit=10&offset=0
Authorization: Bearer {access_token}
```

**Query Parameters**:
- `category`: (optional) career, health, finance, relationship
- `timeframe`: (optional) 1m, 3m, 6m, 12m
- `limit`: (optional, default: 10, max: 100)
- `offset`: (optional, default: 0)

**Response**
```json
{
  "success": true,
  "data": [
    { ... prediction 1 ... },
    { ... prediction 2 ... }
  ],
  "meta": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Get Single Prediction
```http
GET /predictions/{predictionId}
Authorization: Bearer {access_token}
```

---

### Get Prediction Timeline
```http
GET /predictions/timeline?months=12
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "month": "January 2026",
      "phase": "Preparation",
      "career": { "favorability": "high", "recommendation": "..." },
      "health": { "favorability": "medium", "recommendation": "..." },
      "finance": { "favorability": "high", "recommendation": "..." },
      "relationship": { "favorability": "low", "recommendation": "..." }
    },
    ... // 11 more months
  ]
}
```

---

### Record Prediction Outcome
```http
PUT /predictions/{predictionId}/outcome
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "actual_outcome": {
    "promotion": true,
    "salary_increase": 25,
    "new_role": "Senior Manager"
  },
  "user_feedback": "accurate"
}
```

---

## 4. Astrology APIs

### Get Daily Horoscope
```http
GET /astrology/horoscope/daily
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-20",
    "sign": "Taurus",
    "horoscope": "Today brings favorable planetary alignments...",
    "lucky_time": "06:00-08:00",
    "lucky_number": 5,
    "lucky_color": "Blue",
    "health": "Good",
    "emotions": "Positive",
    "romance": "Favorable",
    "work": "Productive day ahead",
    "finance": "Avoid major expenditures"
  }
}
```

---

### Get Transit Analysis
```http
GET /astrology/transits
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-20",
    "planets": [
      {
        "name": "Jupiter",
        "current_sign": "Gemini",
        "natal_sign": "Leo",
        "house": 3,
        "aspects": [
          {
            "type": "conjunction",
            "with": "Mercury",
            "influence": "positive",
            "description": "Enhances communication..."
          }
        ]
      }
    ],
    "important_events": [
      {
        "event": "Mercury Retrograde",
        "date": "2026-01-15",
        "duration": "20 days",
        "impact": "Avoid signing contracts"
      }
    ]
  }
}
```

---

### Get Dasha Periods
```http
GET /astrology/dasha
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "current": {
      "period": "Mercury Mahadasha",
      "start_date": "2024-03-15",
      "end_date": "2041-03-15",
      "remaining_years": 16
    },
    "subPeriods": [
      {
        "period": "Venus Antardasha",
        "start_date": "2024-03-15",
        "end_date": "2025-11-12"
      },
      {
        "period": "Sun Antardasha",
        "start_date": "2025-11-12",
        "end_date": "2026-05-12"
      }
    ],
    "upcomingDashas": [
      { "name": "Ketu", "start": "2041-03-15" }
    ]
  }
}
```

---

### Get Dosha Analysis
```http
GET /astrology/doshas
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "doshas": [
      {
        "name": "Mangal Dosha",
        "severity": "high",
        "description": "Mars in 8th house...",
        "impact": "Challenges in marriage...",
        "remedies": [
          "Wear red coral gemstone",
          "Recite Hanuman Chalisa daily",
          "Perform Mangal Puja"
        ]
      }
    ],
    "compatibility": {
      "dosha_severity": "manageable",
      "recommendations": [...]
    }
  }
}
```

---

## 5. Consultation APIs

### Get Available Astrologers
```http
GET /astrologers?specialty=career&minRating=4.0&limit=10
Authorization: Bearer {access_token}
```

**Query Parameters**:
- `specialty`: (optional) career, health, relationships, finance, general
- `minRating`: (optional, 0-5)
- `availability`: (optional) available, all
- `hourly_rate_max`: (optional)
- `limit`: (optional, default: 10)

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "astro-uuid-123",
      "name": "Dr. Sharma",
      "specialty": "career",
      "experience_years": 15,
      "qualifications": ["B.A. Vedic Astrology", "Certified Astrological Counselor"],
      "languages": ["English", "Hindi", "Marathi"],
      "is_available": true,
      "hourly_rate": 1500,
      "min_duration_minutes": 15,
      "average_rating": 4.8,
      "review_count": 342,
      "total_consultations": 2340,
      "verified": true,
      "profile_image_url": "https://..."
    }
  ]
}
```

---

### Book Consultation
```http
POST /consultations/book
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "astrologer_id": "astro-uuid-123",
  "duration_minutes": 30,
  "consultation_type": "video",
  "scheduled_at": "2025-12-25T10:00:00Z"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "consultation-uuid-123",
    "user_id": "user-uuid-123",
    "astrologer_id": "astro-uuid-123",
    "status": "scheduled",
    "consultation_type": "video",
    "duration_minutes": 30,
    "scheduled_at": "2025-12-25T10:00:00Z",
    "amount_charged": 750,
    "currency": "INR",
    "payment_status": "pending",
    "meeting_url": "https://agora.io/meeting/xyz123"
  }
}
```

---

### Get Consultation Details
```http
GET /consultations/{consultationId}
Authorization: Bearer {access_token}
```

---

### Send Message in Consultation
```http
POST /consultations/{consultationId}/messages
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message_text": "Thank you for the insights",
  "message_type": "text"
}
```

---

### Rate Astrologer
```http
POST /consultations/{consultationId}/rating
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rating": 5,
  "review_text": "Excellent insights, very helpful session!"
}
```

---

## 6. Payment APIs

### Get Subscription Plans
```http
GET /payments/plans
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "tier": "free",
      "price": 0,
      "billing_period": null,
      "features": {
        "predictions_per_month": 3,
        "astrology_readings": true,
        "consultations": false,
        "marketplace_access": false
      }
    },
    {
      "tier": "premium",
      "price": 299,
      "billing_period": "monthly",
      "features": {
        "predictions_per_month": 20,
        "astrology_readings": true,
        "consultations": 4,
        "marketplace_access": true
      }
    },
    {
      "tier": "pro",
      "price": 999,
      "billing_period": "monthly",
      "features": {
        "predictions_per_month": "unlimited",
        "astrology_readings": true,
        "consultations": "unlimited",
        "marketplace_access": true
      }
    }
  ]
}
```

---

### Create Subscription
```http
POST /payments/subscription/create
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "tier": "premium",
  "billing_cycle": "monthly",
  "payment_method_id": "pm_xyz123"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid-123",
    "user_id": "user-uuid-123",
    "tier": "premium",
    "status": "active",
    "stripe_subscription_id": "sub_stripe_123",
    "started_at": "2025-12-20T10:30:00Z",
    "current_period_start": "2025-12-20T10:30:00Z",
    "current_period_end": "2026-01-20T10:30:00Z",
    "amount": 299,
    "currency": "INR"
  }
}
```

---

### Upgrade Subscription
```http
POST /payments/subscription/upgrade
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "new_tier": "pro"
}
```

---

### Cancel Subscription
```http
POST /payments/subscription/cancel
Authorization: Bearer {access_token}
```

---

### Get Invoices
```http
GET /payments/invoices?limit=10
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-uuid-123",
      "amount": 299,
      "currency": "INR",
      "status": "paid",
      "created_at": "2025-12-20T10:30:00Z",
      "invoice_url": "https://invoices.stripe.com/i/xyz",
      "pdf_url": "https://..."
    }
  ]
}
```

---

## 7. Analytics APIs

### Get Income Forecast
```http
GET /analytics/income-forecast?months=12
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "forecast": [
      {
        "month": "January 2026",
        "predicted": 85000,
        "confidence_lower": 80000,
        "confidence_upper": 90000,
        "confidence": 0.85
      }
    ],
    "trend": "upward",
    "seasonality": {
      "peak_months": ["March", "April"],
      "low_months": ["August", "September"]
    }
  }
}
```

---

### Get Health Risk Assessment
```http
GET /analytics/health-risk
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "burnout_risk": 0.72,
    "burnout_trend": "declining",
    "stress_level": "high",
    "sleep_quality_trend": "declining",
    "recommendations": [
      "Take 3-day break",
      "Increase exercise to 30 min daily",
      "Practice meditation"
    ]
  }
}
```

---

### Get Relationship Health
```http
GET /analytics/relationship-health
Authorization: Bearer {access_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "health_score": 7.5,
    "communication_frequency": "3x weekly",
    "conflict_pattern": "weekend peaks",
    "compatibility_cluster": "high"
  }
}
```

---

## 8. Admin APIs

### Get User Analytics
```http
GET /admin/analytics/users
Authorization: Bearer {admin_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "total_users": 125000,
    "active_users": 45000,
    "new_users_today": 320,
    "retention_30d": 0.42,
    "churn_rate": 0.08
  }
}
```

---

### Get Revenue Metrics
```http
GET /admin/analytics/revenue
Authorization: Bearer {admin_token}
```

**Response**
```json
{
  "success": true,
  "data": {
    "mrr": 2850000,
    "arr": 34200000,
    "arpu": 680,
    "subscription_breakdown": {
      "free": 85000,
      "premium": 32000,
      "pro": 8000
    }
  }
}
```

---

### Approve Astrologer
```http
POST /admin/astrologers/{astrologerId}/approve
Authorization: Bearer {admin_token}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid birth date format",
    "details": {
      "field": "birth_date",
      "expected": "YYYY-MM-DD",
      "received": "15-05-1990"
    }
  }
}
```

### Common Error Codes
| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Invalid input data |
| AUTHENTICATION_FAILED | 401 | Invalid credentials |
| UNAUTHORIZED | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

**Free Tier**: 100 requests/hour
**Premium Tier**: 1000 requests/hour
**Pro Tier**: 10000 requests/hour

Response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1703078400
```

---

## Testing with cURL

### Example: Get Predictions
```bash
curl -X GET "https://api.prediction-app.com/v1/predictions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Example: Generate Prediction
```bash
curl -X POST "https://api.prediction-app.com/v1/predictions/generate" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "career",
    "timeframe": "6_months"
  }'
```

---

**Last Updated**: December 20, 2025
**API Version**: v1
**Status**: Production Ready
