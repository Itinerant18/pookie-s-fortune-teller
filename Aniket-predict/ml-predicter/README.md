# ML Engine

This is the Python FastAPI-based Machine Learning Service for Hybrid Predictions.

## Overview

The ML Engine handles:
1. **Astrology Calculations** - Swiss Ephemeris based birth chart generation
2. **ML Predictions** - Time-series forecasting, classification, clustering
3. **Vector Embeddings** - AI-powered article recommendations
4. **Confidence Scoring** - Combines astrology + ML results

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment:
   Copy `.env.example` to `.env` and update values.
   ```bash
   cp .env.example .env
   ```

4. Run the server:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

## Testing

Run tests with pytest:
```bash
pytest
```

## Docker

Build and run with Docker:
```bash
docker build -t ml-engine .
docker run -p 8000:8000 ml-engine
```
# ml-predicter
