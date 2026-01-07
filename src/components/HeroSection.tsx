import { useState, useEffect } from 'react';
import { Search, MapPin, Home, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const heroSlides = [
  {
    id: 1,
    title: 'Find Your Dream Home in Hyderabad',
    subtitle: 'Discover premium apartments, villas, and plots in prime locations',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Luxury Villas in Gachibowli',
    subtitle: 'Exclusive properties with world-class amenities',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Premium Apartments in Hitech City',
    subtitle: 'Modern living spaces close to IT hubs',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=1080&fit=crop&q=80',
  },
];

const propertyTypes = ['Any', 'Apartment', 'Villa', 'Plot', 'Commercial'];
const budgetRanges = ['Any Budget', 'Under 50L', '50L - 1Cr', '1Cr - 2Cr', '2Cr - 5Cr', '5Cr+'];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchType, setSearchType] = useState('Any');
  const [searchBudget, setSearchBudget] = useState('Any Budget');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm transition-colors hidden md:block"
      >
        <ChevronLeft className="h-6 w-6 text-background" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-sm transition-colors hidden md:block"
      >
        <ChevronRight className="h-6 w-6 text-background" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-32 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-accent w-8'
                : 'bg-background/50 hover:bg-background/80'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container h-full flex flex-col justify-center py-20 md:py-24">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-background mb-4 leading-tight">
            {heroSlides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl text-background/90 mb-8">
            {heroSlides[currentSlide].subtitle}
          </p>
        </div>

        {/* Search Box */}
        <div className="search-container max-w-4xl animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter location..."
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Property Type */}
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select
                value={searchBudget}
                onChange={(e) => setSearchBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                {budgetRanges.map((budget) => (
                  <option key={budget} value={budget}>{budget}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button className="w-full py-6 accent-gradient text-accent-foreground font-semibold text-base rounded-xl">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
