import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const widthClass = fullWidth ? 'btn-block' : '';
  const loadingClass = loading ? 'btn-loading' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    loadingClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner spinner-sm" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon-wrapper">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="btn-icon-wrapper">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
