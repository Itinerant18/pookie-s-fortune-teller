import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
import Logo from '../../components/Logo';
import './Auth.css';

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { error: resetError } = await resetPassword(email);
    
    setLoading(false);
    
    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <div className="auth-glow auth-glow-1" />
          <div className="auth-glow auth-glow-2" />
          <div className="auth-stars" />
        </div>
        
        <div className="auth-container">
          <div className="auth-card animate-fadeInUp">
            <div className="auth-success">
              <div className="success-icon success-icon-email animate-scaleIn">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2>Check Your Email</h2>
              <p>
                We've sent password reset instructions to<br />
                <strong>{email}</strong>
              </p>
              <p className="success-hint">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="auth-success-actions">
                <Button 
                  variant="secondary" 
                  onClick={() => setSuccess(false)}
                >
                  Try Different Email
                </Button>
                <Link to="/login">
                  <Button variant="primary">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
        <div className="auth-stars" />
      </div>
      
      <div className="auth-container">
        <div className="auth-card animate-fadeInUp">
          <div className="auth-header">
            <Logo size="lg" />
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">
              Enter your email and we'll send you a reset link
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error-banner animate-fadeIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={null}
              autoComplete="email"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Send Reset Link
            </Button>
          </form>
          
          <div className="auth-footer">
            <span>Remember your password?</span>
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
