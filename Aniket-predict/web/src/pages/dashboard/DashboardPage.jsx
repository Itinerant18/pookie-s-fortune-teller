import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui';
import './Dashboard.css';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuracyRate: 0,
    daysActive: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent predictions
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (predictionsError) throw predictionsError;
      setPredictions(predictionsData || []);

      // Calculate stats
      const daysActive = Math.floor(
        (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
      );

      setStats({
        totalPredictions: predictionsData?.length || 0,
        accuracyRate: 78, // Mock for now
        daysActive: daysActive || 1,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: '📊',
      title: 'Birth Chart',
      description: 'View your cosmic blueprint',
      path: '/birth-chart',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: '🔮',
      title: 'Predictions',
      description: 'Get new predictions',
      path: '/predictions',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: '❤️',
      title: 'Health',
      description: 'Track your wellness',
      path: '/health',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: '💰',
      title: 'Income',
      description: 'Financial forecast',
      path: '/income',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  const getTodaysFortune = () => {
    const fortunes = ['Excellent', 'Good', 'Favorable', 'Mixed', 'Challenging'];
    const fortuneIcons = ['🌟', '⭐', '✨', '🌙', '☁️'];
    const index = new Date().getDate() % 5;
    return { text: fortunes[index], icon: fortuneIcons[index] };
  };

  const fortune = getTodaysFortune();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      career: '💼',
      health: '❤️',
      finance: '💰',
      relationship: '💕',
      default: '🔮',
    };
    return icons[category] || icons.default;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <section className="welcome-section animate-fadeInUp">
        <div className="welcome-content">
          <h1>
            {getGreeting()}, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Cosmic Traveler'}</span>!
          </h1>
          <p>Here's your cosmic overview for today</p>
        </div>
        
        <div className="fortune-card">
          <span className="fortune-icon">{fortune.icon}</span>
          <div className="fortune-content">
            <span className="fortune-label">Today's Fortune</span>
            <span className="fortune-value">{fortune.text}</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section animate-fadeInUp delay-100">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📊
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPredictions}</span>
            <span className="stat-label">Predictions</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            🎯
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.accuracyRate}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            📅
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.daysActive}</span>
            <span className="stat-label">Days Active</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section animate-fadeInUp delay-200">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={action.path}
              to={action.path}
              className="quick-action-card"
              style={{ '--card-gradient': action.gradient }}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <svg className="action-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Predictions */}
      <section className="predictions-section animate-fadeInUp delay-300">
        <div className="section-header">
          <h2 className="section-title">Recent Predictions</h2>
          <Link to="/predictions" className="view-all-link">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="predictions-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="prediction-skeleton">
                <div className="skeleton skeleton-circle" />
                <div className="skeleton-content">
                  <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : predictions.length > 0 ? (
          <div className="predictions-list">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="prediction-card" hover>
                <div className="prediction-icon">
                  {getCategoryIcon(prediction.category)}
                </div>
                <div className="prediction-content">
                  <div className="prediction-header">
                    <h4>{prediction.category}</h4>
                    <span className="badge badge-primary">{prediction.timeframe}</span>
                  </div>
                  <p className="prediction-text">
                    {prediction.combined_prediction?.recommendation || 'Processing...'}
                  </p>
                  <div className="prediction-meta">
                    <span className="prediction-date">
                      {formatDate(prediction.created_at)}
                    </span>
                    {prediction.overall_confidence && (
                      <span className="prediction-confidence">
                        {Math.round(prediction.overall_confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <div className="empty-icon">🔮</div>
            <h3>No predictions yet</h3>
            <p>Generate your first prediction to get cosmic insights</p>
            <Link to="/predictions" className="btn btn-primary">
              Get Started
            </Link>
          </Card>
        )}
      </section>

      {/* Cosmic Insight */}
      <section className="insight-section animate-fadeInUp delay-400">
        <Card className="insight-card">
          <div className="insight-glow" />
          <div className="insight-content">
            <span className="insight-badge">✨ Daily Insight</span>
            <h3>Your Cosmic Energy Today</h3>
            <p>
              The stars align favorably for new beginnings. Your intuition is particularly 
              strong today—trust your inner wisdom when making important decisions.
            </p>
            <div className="insight-tags">
              <span className="tag">🌟 Intuition</span>
              <span className="tag">🚀 New Beginnings</span>
              <span className="tag">💫 Creativity</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
