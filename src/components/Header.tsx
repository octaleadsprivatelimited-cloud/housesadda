import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, Mail, Search, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const cities = ['Hyderabad', 'Secunderabad', 'Gachibowli', 'Hitech City', 'Kondapur'];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top Bar - Contact Info */}
      <div className="hidden md:block hero-gradient text-primary-foreground">
        <div className="container py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+916301575658" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" />
              +91 63015 75658
            </a>
            <a href="mailto:info@housesadda.in" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Mail className="h-4 w-4" />
              info@housesadda.in
            </a>
          </div>
          <p className="text-primary-foreground/80">Your Trusted Property Consultant in Hyderabad</p>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 md:w-12 md:h-12 hero-gradient rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg md:text-xl">HA</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">Houses Adda</h1>
              <p className="text-xs text-muted-foreground">Property Consultant</p>
            </div>
          </Link>

          {/* City Selector - Mobile & Desktop */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1 md:gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">{selectedCity}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-2 animate-scale-in">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors ${
                      city === selectedCity ? 'text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl">
            <div className="flex w-full bg-secondary rounded-xl overflow-hidden">
              <input
                type="text"
                placeholder="Search properties, localities..."
                className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none"
              />
              <Button variant="default" className="rounded-l-none hero-gradient">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/properties" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Properties
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Contact Button - Desktop */}
          <a href="tel:+916301575658" className="hidden md:block">
            <Button className="accent-gradient text-accent-foreground font-semibold">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 lg:hidden">
          <div className="flex w-full bg-secondary rounded-xl overflow-hidden">
            <input
              type="text"
              placeholder="Search properties..."
              className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none"
            />
            <Button variant="default" className="rounded-l-none hero-gradient">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-in">
          <nav className="container py-4 flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/properties"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
            >
              Properties
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
            >
              Contact
            </Link>
            <div className="flex gap-3 mt-2 px-4">
              <a href="tel:+916301575658" className="flex-1">
                <Button className="w-full call-btn">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </a>
              <a href="mailto:info@housesadda.in" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
