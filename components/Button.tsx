/**
 * Example reusable component
 * Remove or modify this based on your project needs
 */

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export default function Button({
  label,
  onClick,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }[variant];

  return (
    <button onClick={onClick} className={`btn ${variantClass} ${className}`}>
      {label}
    </button>
  );
}
