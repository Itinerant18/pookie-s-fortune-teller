import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ size = 'md', showText = true, linkTo = '/' }) => {
  const sizeClasses = {
    sm: 'logo-sm',
    md: 'logo-md',
    lg: 'logo-lg',
    xl: 'logo-xl',
  };

  return (
    <Link to={linkTo} className={`logo ${sizeClasses[size]}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer ring */}
          <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="2" />
          
          {/* Inner star pattern */}
          <path
            d="M20 4L23.5 15H35L25.5 22L29 33L20 26L11 33L14.5 22L5 15H16.5L20 4Z"
            fill="url(#logoGradient)"
            opacity="0.9"
          />
          
          {/* Center dot */}
          <circle cx="20" cy="20" r="3" fill="white" />
          
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="logo-text">
          <span className="logo-title">Cosmic</span>
          <span className="logo-subtitle">Predict</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
