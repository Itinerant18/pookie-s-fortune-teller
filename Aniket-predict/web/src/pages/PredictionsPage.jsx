import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { predictionsApi } from '../services/api';
import { Button, Card } from '../components/ui';
import './Pages.css';

const PredictionsPage = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6_months');

  const categories = [
    { value: 'all', label: 'All', icon: '🔮' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'health', label: 'Health', icon: '❤️' },
    { value: 'relationship', label: 'Relationship', icon: '💕' },
  ];

  const timeframes = [
    { value: '1_month', label: '1 Month' },
    { value: '3_months', label: '3 Months' },
    { value: '6_months', label: '6 Months' },
    { value: '12_months', label: '1 Year' },
  ];

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user, selectedCategory]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const response = await predictionsApi.getAll({ category: selectedCategory });
      setPredictions(response.data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrediction = async (category) => {
    try {
      setGenerating(true);
      
      // Call backend API through service
      await predictionsApi.generate({
        category,
        timeframe: selectedTimeframe,
      });
      
      // Refresh predictions list
      await fetchPredictions();
    } catch (error) {
      console.error('Error generating prediction:', error);
      alert('Failed to generate prediction. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '🔮';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page predictions-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>Predictions</h1>
          <p>Generate and view your cosmic predictions</p>
        </div>
      </div>

      {/* Generate Section */}
      <Card className="generate-section">
        <h3>Generate New Prediction</h3>
        <p>Select a category and timeframe to get personalized predictions</p>
        
        <div className="generate-options">
          <div className="option-group">
            <label>Timeframe</label>
            <div className="timeframe-buttons">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  className={`timeframe-btn ${selectedTimeframe === tf.value ? 'active' : ''}`}
                  onClick={() => setSelectedTimeframe(tf.value)}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="category-cards">
            {categories.filter(c => c.value !== 'all').map(cat => (
              <button
                key={cat.value}
                className="category-card"
                onClick={() => generatePrediction(cat.value)}
                disabled={generating}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.label}</span>
                {generating ? (
                  <span className="spinner spinner-sm" />
                ) : (
                  <span className="generate-label">Generate</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`filter-tab ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Predictions List */}
      <div className="predictions-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="prediction-skeleton">
              <div className="skeleton skeleton-header" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
            </div>
          ))
        ) : predictions.length > 0 ? (
          predictions.map((prediction) => (
            <Card key={prediction.id} className="prediction-detail-card" hover>
              <div className="prediction-card-header">
                <span className="prediction-category-icon">
                  {getCategoryIcon(prediction.category)}
                </span>
                <div className="prediction-card-meta">
                  <h4>{prediction.category}</h4>
                  <span className="badge badge-primary">{prediction.timeframe}</span>
                </div>
              </div>
              
              <div className="prediction-card-body">
                <p>{prediction.combined_prediction?.recommendation || 'Processing your cosmic data...'}</p>
              </div>
              
              <div className="prediction-card-footer">
                <span className="prediction-date">{formatDate(prediction.created_at)}</span>
                {prediction.overall_confidence && (
                  <div className="confidence-meter">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${prediction.overall_confidence * 100}%` }} 
                    />
                    <span>{Math.round(prediction.overall_confidence * 100)}%</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="empty-state-large">
            <div className="empty-icon">🔮</div>
            <h3>No predictions yet</h3>
            <p>Generate your first prediction by selecting a category above</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;
