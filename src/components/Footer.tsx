import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">HA</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Houses Adda</h3>
                <p className="text-sm text-background/70">Property Consultant</p>
              </div>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property in Hyderabad. 
              We help you discover homes that match your dreams and budget.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-background/80 hover:text-accent transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-background/80 hover:text-accent transition-colors text-sm">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/80 hover:text-accent transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/80 hover:text-accent transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Property Types</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/properties?type=apartment" className="text-background/80 hover:text-accent transition-colors text-sm">
                  Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?type=villa" className="text-background/80 hover:text-accent transition-colors text-sm">
                  Villas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=plot" className="text-background/80 hover:text-accent transition-colors text-sm">
                  Plots
                </Link>
              </li>
              <li>
                <Link to="/properties?type=commercial" className="text-background/80 hover:text-accent transition-colors text-sm">
                  Commercial
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+916301575658" className="flex items-start gap-3 text-background/80 hover:text-accent transition-colors">
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">+91 63015 75658</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@housesadda.in" className="flex items-start gap-3 text-background/80 hover:text-accent transition-colors">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">info@housesadda.in</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-background/80">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Hyderabad, Telangana, India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {new Date().getFullYear()} Houses Adda. All rights reserved.</p>
            <p>
              Developed by{' '}
              <span className="text-accent font-medium">OctaLeads Pvt Ltd</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
