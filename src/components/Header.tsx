import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Buy', href: '/properties?intent=buy' },
  { label: 'Rent', href: '/properties?intent=rent' },
  { label: 'New Projects', href: '/properties?type=new' },
  { label: 'Plot', href: '/properties?type=plot' },
  { label: 'Commercial', href: '/properties?type=commercial' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Primary Header - Red */}
      <div className="mb-header">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-primary font-bold text-lg">Houses</span>
                <span className="text-foreground font-bold text-lg">Adda</span>
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <a href="tel:+916301575658" className="hidden md:flex items-center gap-2 text-white/90 hover:text-white text-sm">
                <Phone className="h-4 w-4" />
                +91 63015 75658
              </a>
              
              <Link to="/admin" className="hidden md:flex items-center gap-1 text-white/90 hover:text-white text-sm">
                <User className="h-4 w-4" />
                Login
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Header - Navigation */}
      <div className="mb-header-secondary">
        <div className="container">
          <nav className="hidden md:flex items-center gap-1 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container py-4">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-border flex gap-3">
              <a href="tel:+916301575658" className="flex-1">
                <Button className="w-full mb-btn-primary">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </a>
              <Link to="/admin" className="flex-1">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
