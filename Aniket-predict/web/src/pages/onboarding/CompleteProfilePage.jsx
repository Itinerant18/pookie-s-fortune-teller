import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import Logo from '../../components/Logo';
import './Onboarding.css';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding, loading } = useAuth();
  
  const [birthChartData, setBirthChartData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Retrieve birth chart data from previous step
    const storedData = sessionStorage.getItem('birthChartData');
    if (storedData) {
      setBirthChartData(JSON.parse(storedData));
    } else {
      // Redirect back if no birth chart data
      navigate('/onboarding/birth-chart');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    // Prepare profile data
    const profileData = {
      full_name: formData.fullName,
      gender: formData.gender,
      birth_date: birthChartData.birthDate,
      birth_place: birthChartData.birthPlace,
      birth_lat: birthChartData.birthLat,
      birth_lon: birthChartData.birthLon,
    };

    // Prepare birth chart data
    const chartData = {
      birth_date: birthChartData.birthDate,
      birth_time: birthChartData.birthTime,
      birth_location_name: birthChartData.birthPlace,
      birth_location_lat: birthChartData.birthLat,
      birth_location_lng: birthChartData.birthLon,
      birth_time_accuracy: 'exact',
    };

    const { error } = await completeOnboarding(profileData, chartData);
    
    setIsSubmitting(false);

    if (error) {
      setErrors({ submit: error.message });
    } else {
      // Clear session storage
      sessionStorage.removeItem('birthChartData');
      setShowSuccess(true);
      
      // Redirect to dashboard after animation
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    }
  };

  if (showSuccess) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-background">
          <div className="cosmic-orb cosmic-orb-1" />
          <div className="cosmic-orb cosmic-orb-2" />
          <div className="success-burst" />
        </div>

        <div className="success-container animate-scaleIn">
          <div className="success-animation">
            <div className="success-ring" />
            <div className="success-checkmark">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h1 className="success-title">You're All Set!</h1>
          <p className="success-text">
            Your cosmic profile has been created successfully.
            <br />
            Preparing your personalized dashboard...
          </p>
          <div className="success-loader">
            <div className="loader-bar" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-background">
        <div className="cosmic-orb cosmic-orb-1" />
        <div className="cosmic-orb cosmic-orb-2" />
      </div>

      <div className="onboarding-container">
        <div className="onboarding-header animate-fadeInDown">
          <Logo size="md" />
          
          <div className="progress-indicator">
            <div className="progress-step completed">
              <div className="step-circle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Birth Details</span>
            </div>
            <div className="progress-line active" />
            <div className="progress-step active">
              <div className="step-circle">2</div>
              <span>Profile</span>
            </div>
          </div>
        </div>

        <Card className="onboarding-card animate-fadeInUp">
          <div className="onboarding-card-header">
            <div className="card-icon card-icon-profile">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1>Complete Your Profile</h1>
            <p>Just a few more details to personalize your experience</p>
          </div>

          <form onSubmit={handleSubmit} className="onboarding-form">
            {errors.submit && (
              <div className="auth-error-banner animate-fadeIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="gender-options">
                {[
                  { value: 'male', label: 'Male', icon: '♂' },
                  { value: 'female', label: 'Female', icon: '♀' },
                  { value: 'other', label: 'Other', icon: '⚧' },
                ].map(option => (
                  <label
                    key={option.value}
                    className={`gender-option ${formData.gender === option.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={handleChange}
                    />
                    <span className="gender-icon">{option.icon}</span>
                    <span className="gender-label">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <span className="form-error">{errors.gender}</span>}
            </div>

            {birthChartData && (
              <div className="summary-section">
                <h4>Birth Chart Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Date</span>
                    <span className="summary-value">
                      {new Date(birthChartData.birthDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Time</span>
                    <span className="summary-value">{birthChartData.birthTime}</span>
                  </div>
                  <div className="summary-item summary-item-full">
                    <span className="summary-label">Place</span>
                    <span className="summary-value">{birthChartData.birthPlace}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/onboarding/birth-chart')}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting || loading}
              >
                Complete Setup
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
