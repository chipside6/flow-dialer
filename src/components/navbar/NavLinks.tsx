
import { Link } from 'react-router-dom';

interface NavLinksProps {
  mobile?: boolean;
  onClick?: () => void;
}

export const NavLinks = ({ mobile = false, onClick }: NavLinksProps) => {
  const linkClass = mobile 
    ? "mobile-nav-link" 
    : "text-sm font-medium hover:text-primary transition-colors";

  return (
    <>
      <Link to="/" className={linkClass} onClick={onClick}>
        Home
      </Link>
      <Link to="/features" className={linkClass} onClick={onClick}>
        Features
      </Link>
      <Link to="/pricing" className={linkClass} onClick={onClick}>
        Pricing
      </Link>
      <Link to="/support" className={linkClass} onClick={onClick}>
        Support
      </Link>
    </>
  );
};
