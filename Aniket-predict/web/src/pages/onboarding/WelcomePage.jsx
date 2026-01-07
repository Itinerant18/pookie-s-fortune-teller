import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui';
import Logo from '../../components/Logo';
import './Onboarding.css';

const WelcomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '🌟',
      title: 'Birth Chart Analysis',
      description: 'Discover your cosmic blueprint with detailed Vedic astrology insights',
    },
    {
      icon: '💰',
      title: 'Income Forecasting',
      description: 'AI-powered predictions for your financial future',
    },
    {
      icon: '❤️',
      title: 'Health Predictions',
      description: 'Personalized wellness insights based on your unique profile',
    },
    {
      icon: '🔮',
      title: 'Hybrid Predictions',
      description: 'Combining ancient wisdom with modern AI for accurate forecasts',
    },
  ];

  return (
    <div className="onboarding-page welcome-page">
      <div className="onboarding-background">
        <div className="cosmic-orb cosmic-orb-1" />
        <div className="cosmic-orb cosmic-orb-2" />
        <div className="cosmic-orb cosmic-orb-3" />
        <div className="stars-layer" />
      </div>

      <div className="welcome-container">
        <div className="welcome-header animate-fadeInDown">
          <Logo size="xl" />
          <h1 className="welcome-title">
            Welcome to Your
            <span className="gradient-text"> Cosmic Journey</span>
          </h1>
          <p className="welcome-subtitle">
            {user?.email ? `Hello, ${user.user_metadata?.full_name || user.email}! ` : ''}
            Unlock the power of astrology and AI to predict your future
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card animate-fadeInUp"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="welcome-actions animate-fadeInUp delay-500">
          <Link to="/onboarding/birth-chart">
            <Button variant="primary" size="xl">
              Get Started
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
          <p className="welcome-hint">
            Takes only 2 minutes to set up your profile
          </p>
        </div>

        <div className="welcome-testimonial animate-fadeIn delay-500">
          <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
          <p className="testimonial-text">
            "The predictions have been incredibly accurate. It's like having a personal cosmic guide!"
          </p>
          <p className="testimonial-author">— Sarah K., Premium User</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
