interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export default function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
