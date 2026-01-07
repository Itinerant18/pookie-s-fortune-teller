import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';
import Logo from '../../components/Logo';
import './Onboarding.css';

const BirthChartPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    birthLat: null,
    birthLon: null,
  });
  const [errors, setErrors] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Mock location suggestions - in production, use a geocoding API
  const mockLocations = [
    // India
    { name: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777 },
    { name: 'Bangalore, Karnataka, India', lat: 12.9716, lon: 77.5946 },
    { name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639 },
    { name: 'Hyderabad, Telangana, India', lat: 17.3850, lon: 78.4867 },
    { name: 'Pune, Maharashtra, India', lat: 18.5204, lon: 73.8567 },
    { name: 'Ahmedabad, Gujarat, India', lat: 23.0225, lon: 72.5714 },
    { name: 'Jaipur, Rajasthan, India', lat: 26.9124, lon: 75.7873 },
    { name: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lon: 80.9462 },
    { name: 'Chandigarh, Punjab, India', lat: 30.7333, lon: 76.7794 },
    { name: 'Bhopal, Madhya Pradesh, India', lat: 23.2599, lon: 77.4126 },
    { name: 'Surat, Gujarat, India', lat: 21.1702, lon: 72.8311 },
    { name: 'Kochi, Kerala, India', lat: 9.9312, lon: 76.2673 },
    { name: 'Indore, Madhya Pradesh, India', lat: 22.7196, lon: 75.8577 },
    { name: 'Nagpur, Maharashtra, India', lat: 21.1458, lon: 79.0882 },
    { name: 'Patna, Bihar, India', lat: 25.5941, lon: 85.1376 },
    { name: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lon: 82.9739 },
    { name: 'Guwahati, Assam, India', lat: 26.1445, lon: 91.7362 },
    { name: 'Thiruvananthapuram, Kerala, India', lat: 8.5241, lon: 76.9366 },
    // USA
    { name: 'New York, NY, USA', lat: 40.7128, lon: -74.0060 },
    { name: 'Los Angeles, CA, USA', lat: 34.0522, lon: -118.2437 },
    { name: 'Chicago, IL, USA', lat: 41.8781, lon: -87.6298 },
    { name: 'Houston, TX, USA', lat: 29.7604, lon: -95.3698 },
    { name: 'San Francisco, CA, USA', lat: 37.7749, lon: -122.4194 },
    { name: 'Seattle, WA, USA', lat: 47.6062, lon: -122.3321 },
    { name: 'Boston, MA, USA', lat: 42.3601, lon: -71.0589 },
    // UK
    { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278 },
    { name: 'Manchester, United Kingdom', lat: 53.4808, lon: -2.2426 },
    { name: 'Birmingham, United Kingdom', lat: 52.4862, lon: -1.8904 },
    // Other
    { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
    { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
    { name: 'Berlin, Germany', lat: 52.5200, lon: 13.4050 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Location autocomplete simulation
    if (name === 'birthPlace' && value.length > 1) {
      setLoadingLocation(true);
      // Simulate API delay
      setTimeout(() => {
        const searchTerm = value.toLowerCase();
        // Filter locations that match the search term
        let filtered = mockLocations.filter(loc => 
          loc.name.toLowerCase().includes(searchTerm)
        );
        
        // If no exact matches, show all locations as suggestions
        if (filtered.length === 0) {
          // Sort by relevance - put locations starting with the search term first
          filtered = [...mockLocations].sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(searchTerm);
            const bStarts = b.name.toLowerCase().startsWith(searchTerm);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.name.localeCompare(b.name);
          }).slice(0, 10);
        } else {
          // Limit to 10 results
          filtered = filtered.slice(0, 10);
        }
        
        setLocationSuggestions(filtered);
        setShowSuggestions(true);
        setLoadingLocation(false);
      }, 200);
    } else if (name === 'birthPlace' && value.length <= 1) {
      setShowSuggestions(false);
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      birthPlace: location.name,
      birthLat: location.lat,
      birthLon: location.lon,
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const date = new Date(formData.birthDate);
      if (date > new Date()) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }
    
    if (!formData.birthTime) {
      newErrors.birthTime = 'Birth time is required for accurate predictions';
    }
    
    if (!formData.birthPlace) {
      newErrors.birthPlace = 'Birth place is required';
    } else if (!formData.birthLat || !formData.birthLon) {
      newErrors.birthPlace = 'Please select a location from the suggestions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Store birth chart data in sessionStorage to pass to next step
    sessionStorage.setItem('birthChartData', JSON.stringify(formData));
    navigate('/onboarding/complete-profile');
  };

  const today = new Date().toISOString().split('T')[0];

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
            <div className="progress-step active">
              <div className="step-circle">1</div>
              <span>Birth Details</span>
            </div>
            <div className="progress-line" />
            <div className="progress-step">
              <div className="step-circle">2</div>
              <span>Profile</span>
            </div>
          </div>
        </div>

        <Card className="onboarding-card animate-fadeInUp">
          <div className="onboarding-card-header">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h1>Your Birth Details</h1>
            <p>We need accurate birth information to calculate your cosmic chart</p>
          </div>

          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Birth Date
                </label>
                <input
                  type="date"
                  name="birthDate"
                  className={`form-input ${errors.birthDate ? 'error' : ''}`}
                  value={formData.birthDate}
                  onChange={handleChange}
                  max={today}
                />
                {errors.birthDate && <span className="form-error">{errors.birthDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Birth Time
                </label>
                <input
                  type="time"
                  name="birthTime"
                  className={`form-input ${errors.birthTime ? 'error' : ''}`}
                  value={formData.birthTime}
                  onChange={handleChange}
                />
                {errors.birthTime && <span className="form-error">{errors.birthTime}</span>}
                <span className="form-hint">Use 24-hour format for accuracy</span>
              </div>
            </div>

            <div className="form-group location-input">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Birth Place
              </label>
              <div className="location-wrapper">
                <input
                  type="text"
                  name="birthPlace"
                  className={`form-input ${errors.birthPlace ? 'error' : ''}`}
                  placeholder="Start typing your birth city..."
                  value={formData.birthPlace}
                  onChange={handleChange}
                  onFocus={() => formData.birthPlace.length > 1 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {loadingLocation && (
                  <div className="location-loading">
                    <span className="spinner spinner-sm" />
                  </div>
                )}
                
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="location-suggestions">
                    {locationSuggestions.map((loc, index) => (
                      <button
                        key={index}
                        type="button"
                        className="location-suggestion"
                        onClick={() => selectLocation(loc)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.birthPlace && <span className="form-error">{errors.birthPlace}</span>}
              
              {formData.birthLat && formData.birthLon && (
                <div className="coordinates-display">
                  <span className="badge badge-success">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Location verified
                  </span>
                  <span className="coordinates">
                    {formData.birthLat.toFixed(4)}°, {formData.birthLon.toFixed(4)}°
                  </span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/onboarding/welcome')}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" size="lg">
                Continue
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </form>
        </Card>

        <div className="onboarding-info animate-fadeIn delay-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Accurate birth details are essential for precise astrological calculations.
            Your data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BirthChartPage;
