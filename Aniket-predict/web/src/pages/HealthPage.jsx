import { useState } from 'react';
import { healthApi } from '../services/api';
import { Card, Button } from '../components/ui';
import './Pages.css';

const HealthPage = () => {
  const [metrics, setMetrics] = useState({
    workHours: 8,
    sleepHours: 7,
    exerciseMinutes: 30,
    moodScore: 7,
    stressScore: 4,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleSliderChange = (name, value) => {
    setMetrics(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const analyzeHealth = async () => {
    setAnalyzing(true);
    
    try {
      // Call backend API for ML-powered analysis
      const response = await healthApi.analyzeStress(metrics);
      
      if (response.success && response.data) {
        const mlAnalysis = response.data;
        setAnalysis({
          stressLevel: mlAnalysis.stress_level,
          status: getStressStatus(mlAnalysis.stress_level),
          recommendations: mlAnalysis.recommendations.map((text, i) => ({
            icon: ['🧘', '💤', '🏃', '🌿', '😴'][i % 5],
            text
          })),
        });
      } else {
        // Fallback to local calculation
        const stressLevel = calculateStressLevel();
        setAnalysis({
          stressLevel,
          status: getStressStatus(stressLevel),
          recommendations: getRecommendations(stressLevel),
        });
      }
    } catch (error) {
      console.error('Error analyzing health:', error);
      // Fallback to local calculation
      const stressLevel = calculateStressLevel();
      setAnalysis({
        stressLevel,
        status: getStressStatus(stressLevel),
        recommendations: getRecommendations(stressLevel),
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const calculateStressLevel = () => {
    // Simple stress calculation based on metrics
    let stress = 5;
    stress += (metrics.workHours - 8) * 0.5;
    stress -= (metrics.sleepHours - 7) * 0.3;
    stress -= (metrics.exerciseMinutes / 30) * 0.5;
    stress -= (metrics.moodScore - 5) * 0.2;
    stress += (metrics.stressScore - 5) * 0.4;
    return Math.max(0, Math.min(10, Math.round(stress * 10) / 10));
  };

  const getStressStatus = (level) => {
    if (level <= 3) return { label: 'Low', color: 'var(--success)', emoji: '😊' };
    if (level <= 6) return { label: 'Moderate', color: 'var(--warning)', emoji: '😐' };
    return { label: 'High', color: 'var(--error)', emoji: '😰' };
  };

  const getRecommendations = (level) => {
    const base = [
      { icon: '🧘', text: 'Practice 10 minutes of meditation daily' },
      { icon: '💤', text: 'Maintain a consistent sleep schedule' },
    ];
    
    if (level > 5) {
      base.push({ icon: '🏃', text: 'Increase physical activity to reduce stress' });
      base.push({ icon: '🌿', text: 'Consider relaxation techniques like deep breathing' });
    }
    
    if (metrics.sleepHours < 7) {
      base.push({ icon: '😴', text: 'Aim for at least 7-8 hours of sleep' });
    }
    
    return base;
  };

  const getSliderColor = (value, max, invert = false) => {
    const ratio = value / max;
    const adjustedRatio = invert ? 1 - ratio : ratio;
    
    if (adjustedRatio >= 0.7) return 'var(--success)';
    if (adjustedRatio >= 0.4) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="page health-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Health & Wellness</h1>
          <p>Track your metrics and get personalized health insights</p>
        </div>
      </div>

      {/* Metrics Input */}
      <Card className="metrics-card">
        <h3>Today's Metrics</h3>
        <div className="metrics-form">
          <div className="metric-slider">
            <div className="slider-header">
              <label>Work Hours</label>
              <span className="slider-value">{metrics.workHours}h</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={metrics.workHours}
              onChange={(e) => handleSliderChange('workHours', e.target.value)}
              style={{ '--slider-color': getSliderColor(metrics.workHours, 16, true) }}
            />
            <div className="slider-labels">
              <span>1h</span>
              <span>16h</span>
            </div>
          </div>

          <div className="metric-slider">
            <div className="slider-header">
              <label>Sleep Hours</label>
              <span className="slider-value">{metrics.sleepHours}h</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={metrics.sleepHours}
              onChange={(e) => handleSliderChange('sleepHours', e.target.value)}
              style={{ '--slider-color': getSliderColor(metrics.sleepHours, 8) }}
            />
            <div className="slider-labels">
              <span>1h</span>
              <span>12h</span>
            </div>
          </div>

          <div className="metric-slider">
            <div className="slider-header">
              <label>Exercise</label>
              <span className="slider-value">{metrics.exerciseMinutes} min</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={metrics.exerciseMinutes}
              onChange={(e) => handleSliderChange('exerciseMinutes', e.target.value)}
              style={{ '--slider-color': getSliderColor(metrics.exerciseMinutes, 60) }}
            />
            <div className="slider-labels">
              <span>0 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="metric-slider">
            <div className="slider-header">
              <label>Mood Score</label>
              <span className="slider-value">{metrics.moodScore}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.moodScore}
              onChange={(e) => handleSliderChange('moodScore', e.target.value)}
              style={{ '--slider-color': getSliderColor(metrics.moodScore, 10) }}
            />
            <div className="slider-labels">
              <span>😢 1</span>
              <span>10 😄</span>
            </div>
          </div>

          <div className="metric-slider">
            <div className="slider-header">
              <label>Stress Level</label>
              <span className="slider-value">{metrics.stressScore}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.stressScore}
              onChange={(e) => handleSliderChange('stressScore', e.target.value)}
              style={{ '--slider-color': getSliderColor(metrics.stressScore, 10, true) }}
            />
            <div className="slider-labels">
              <span>😌 1</span>
              <span>10 😰</span>
            </div>
          </div>
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={analyzeHealth}
          loading={analyzing}
        >
          Analyze & Get Recommendations
        </Button>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results animate-fadeInUp">
          <Card className="stress-result-card">
            <div className="stress-indicator">
              <span className="stress-emoji">{analysis.status.emoji}</span>
              <div className="stress-details">
                <span className="stress-label">Stress Assessment</span>
                <span className="stress-value" style={{ color: analysis.status.color }}>
                  {analysis.stressLevel}/10 - {analysis.status.label}
                </span>
              </div>
            </div>
            <div className="stress-meter">
              <div 
                className="stress-fill" 
                style={{ 
                  width: `${analysis.stressLevel * 10}%`,
                  background: analysis.status.color,
                }} 
              />
            </div>
          </Card>

          <Card className="recommendations-card">
            <h3>Wellness Recommendations</h3>
            <div className="recommendations-list">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="rec-icon">{rec.icon}</span>
                  <p>{rec.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HealthPage;
