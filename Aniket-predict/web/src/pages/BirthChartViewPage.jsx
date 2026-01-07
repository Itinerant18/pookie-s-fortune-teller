import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, Button } from '../components/ui';
import './Pages.css';

const BirthChartViewPage = () => {
  const { user } = useAuth();
  const [birthChart, setBirthChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBirthChart();
    }
  }, [user]);

  const fetchBirthChart = async () => {
    try {
      const { data, error } = await supabase
        .from('birth_charts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBirthChart(data);
    } catch (error) {
      console.error('Error fetching birth chart:', error);
    } finally {
      setLoading(false);
    }
  };

  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', element: 'Fire' },
    { name: 'Taurus', symbol: '♉', element: 'Earth' },
    { name: 'Gemini', symbol: '♊', element: 'Air' },
    { name: 'Cancer', symbol: '♋', element: 'Water' },
    { name: 'Leo', symbol: '♌', element: 'Fire' },
    { name: 'Virgo', symbol: '♍', element: 'Earth' },
    { name: 'Libra', symbol: '♎', element: 'Air' },
    { name: 'Scorpio', symbol: '♏', element: 'Water' },
    { name: 'Sagittarius', symbol: '♐', element: 'Fire' },
    { name: 'Capricorn', symbol: '♑', element: 'Earth' },
    { name: 'Aquarius', symbol: '♒', element: 'Air' },
    { name: 'Pisces', symbol: '♓', element: 'Water' },
  ];

  const planets = [
    { name: 'Sun', symbol: '☉', color: '#f59e0b' },
    { name: 'Moon', symbol: '☽', color: '#a1a1aa' },
    { name: 'Mercury', symbol: '☿', color: '#06b6d4' },
    { name: 'Venus', symbol: '♀', color: '#ec4899' },
    { name: 'Mars', symbol: '♂', color: '#ef4444' },
    { name: 'Jupiter', symbol: '♃', color: '#f97316' },
    { name: 'Saturn', symbol: '♄', color: '#64748b' },
    { name: 'Rahu', symbol: '☊', color: '#6366f1' },
    { name: 'Ketu', symbol: '☋', color: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="page birth-chart-page">
        <div className="loading-state">
          <div className="spinner spinner-lg" />
          <p>Loading your birth chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page birth-chart-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Birth Chart</h1>
          <p>Your cosmic blueprint and planetary positions</p>
        </div>
      </div>

      {birthChart ? (
        <div className="birth-chart-content">
          {/* Birth Details Card */}
          <Card className="birth-details-card">
            <h3>Birth Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Date</span>
                <span className="detail-value">
                  {new Date(birthChart.birth_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time</span>
                <span className="detail-value">{birthChart.birth_time || 'Not specified'}</span>
              </div>
              <div className="detail-item detail-full">
                <span className="detail-label">Place</span>
                <span className="detail-value">{birthChart.birth_location_name}</span>
              </div>
            </div>
          </Card>

          {/* Chart Visualization */}
          <Card className="chart-visual-card">
            <h3>Zodiac Wheel</h3>
            <div className="chart-wheel">
              <svg viewBox="0 0 400 400" className="wheel-svg">
                {/* Outer circle */}
                <circle cx="200" cy="200" r="180" fill="none" stroke="var(--border-primary)" strokeWidth="2" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="var(--border-secondary)" strokeWidth="1" />
                <circle cx="200" cy="200" r="60" fill="none" stroke="var(--border-secondary)" strokeWidth="1" />
                
                {/* Zodiac signs */}
                {zodiacSigns.map((sign, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 200 + 160 * Math.cos(angle);
                  const y = 200 + 160 * Math.sin(angle);
                  return (
                    <g key={sign.name}>
                      <line
                        x1={200 + 140 * Math.cos(angle)}
                        y1={200 + 140 * Math.sin(angle)}
                        x2={200 + 180 * Math.cos(angle)}
                        y2={200 + 180 * Math.sin(angle)}
                        stroke="var(--border-primary)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="var(--text-secondary)"
                        fontSize="16"
                      >
                        {sign.symbol}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center */}
                <circle cx="200" cy="200" r="20" fill="var(--primary-600)" />
                <text
                  x="200"
                  y="200"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  ☉
                </text>
              </svg>
            </div>
          </Card>

          {/* Planets Legend */}
          <Card className="planets-card">
            <h3>Planetary Positions</h3>
            <div className="planets-grid">
              {planets.map(planet => (
                <div key={planet.name} className="planet-item">
                  <span className="planet-symbol" style={{ color: planet.color }}>
                    {planet.symbol}
                  </span>
                  <div className="planet-info">
                    <span className="planet-name">{planet.name}</span>
                    <span className="planet-sign">
                      {birthChart.planets?.[planet.name.toLowerCase()]?.sign || 'Calculating...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Interpretations */}
          <Card className="interpretation-card">
            <h3>Chart Interpretation</h3>
            <div className="interpretation-content">
              <div className="interpretation-section">
                <h4>☉ Sun Sign</h4>
                <p>
                  Your Sun sign represents your core identity and conscious ego. 
                  It influences your basic personality traits and how you express yourself.
                </p>
              </div>
              <div className="interpretation-section">
                <h4>☽ Moon Sign</h4>
                <p>
                  Your Moon sign governs your emotional nature, instincts, and subconscious patterns. 
                  It reveals how you process feelings and what makes you feel secure.
                </p>
              </div>
              <div className="interpretation-section">
                <h4>↑ Ascendant</h4>
                <p>
                  Your Ascendant, or rising sign, determines how others perceive you 
                  and the mask you wear in social situations.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="empty-state-large">
          <div className="empty-icon">🌟</div>
          <h3>Birth chart not found</h3>
          <p>Complete your profile setup to generate your birth chart</p>
          <Button variant="primary">Complete Setup</Button>
        </Card>
      )}
    </div>
  );
};

export default BirthChartViewPage;
