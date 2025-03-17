
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
            >
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">D</span>
              Dandy
            </Link>
            <p className="text-muted-foreground text-sm">
              Modern communication tools that simplify your calling experience.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <FooterLink to="/features">Features</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/support">Contact</FooterLink>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dandy Dialer. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <FooterLink to="/privacy">Privacy</FooterLink>
            <FooterLink to="/terms">Terms</FooterLink>
            <FooterLink to="/cookies">Cookies</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link 
      to={to} 
      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);
