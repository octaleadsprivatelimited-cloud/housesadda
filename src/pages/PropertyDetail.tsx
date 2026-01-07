import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  Heart,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';

// Sample property data (would come from API in real app)
const propertyData = {
  id: '1',
  title: 'Luxury 3 BHK Apartment in Gachibowli',
  type: 'Apartment',
  city: 'Hyderabad',
  area: 'Gachibowli',
  price: 15000000,
  priceUnit: 'onwards',
  bedrooms: 3,
  bathrooms: 3,
  sqft: 2100,
  isFeatured: true,
  brochureUrl: 'https://drive.google.com/file/d/example1',
  images: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=800&fit=crop&q=80',
  ],
  description: `Experience luxury living at its finest in this stunning 3 BHK apartment located in the heart of Gachibowli. This premium property offers modern amenities, spacious interiors, and breathtaking views.

The apartment features a well-designed layout with premium flooring, modular kitchen, and contemporary fixtures throughout. Large windows ensure ample natural light and ventilation.

Located in one of Hyderabad's most sought-after IT corridors, this property offers excellent connectivity to major tech parks, schools, hospitals, and shopping centers.`,
  amenities: [
    '24/7 Security',
    'Swimming Pool',
    'Gymnasium',
    'Clubhouse',
    'Children\'s Play Area',
    'Landscaped Gardens',
    'Power Backup',
    'Covered Parking',
    'Intercom Facility',
    'Rainwater Harvesting',
    'CCTV Surveillance',
    'Jogging Track',
  ],
  highlights: [
    'Ready to Move',
    'East Facing',
    'Vastu Compliant',
    'Near IT Parks',
    'Metro Connectivity',
    'HMDA Approved',
  ],
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30452.68657654982!2d78.34!3d17.44!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sGachibowli%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1704067200000!5m2!1sen!2sin',
  postedDate: '2024-01-05',
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    amenities: true,
    location: true,
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Crore`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % propertyData.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
  };

  const whatsappMessage = `Hi Houses Adda, I'm interested in this property: ${propertyData.title} in ${propertyData.area}, ${propertyData.city}. Price: ${formatPrice(propertyData.price)}`;
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-24 md:pb-0">
        {/* Breadcrumb */}
        <div className="bg-secondary/50 py-3">
          <div className="container">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
              <span className="text-muted-foreground">/</span>
              <Link to="/properties" className="text-muted-foreground hover:text-primary">Properties</Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium truncate">{propertyData.title}</span>
            </div>
          </div>
        </div>

        {/* Image Slider - Full Width on Mobile */}
        <section className="relative bg-foreground">
          <div className="relative aspect-[16/10] md:aspect-[21/9] max-h-[600px] overflow-hidden">
            <img
              src={propertyData.images[currentImage]}
              alt={`${propertyData.title} - Image ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/80 text-background px-4 py-2 rounded-full text-sm font-medium">
              {currentImage + 1} / {propertyData.images.length}
            </div>

            {/* Featured Badge */}
            {propertyData.isFeatured && (
              <span className="absolute top-4 left-4 featured-badge">Featured</span>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-3 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-3 rounded-full bg-background/80 hover:bg-background shadow-lg transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="container py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {propertyData.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImage ? 'border-accent' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Property Info */}
        <section className="py-6 md:py-10">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Price */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">{propertyData.type}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{propertyData.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>{propertyData.area}, {propertyData.city}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-price">
                      {formatPrice(propertyData.price)}
                    </span>
                    {propertyData.priceUnit && (
                      <span className="text-muted-foreground">({propertyData.priceUnit})</span>
                    )}
                  </div>
                </div>

                {/* Quick Specs */}
                <div className="flex flex-wrap gap-4 p-4 bg-secondary/50 rounded-2xl">
                  {propertyData.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <span className="font-medium">{propertyData.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {propertyData.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <span className="font-medium">{propertyData.bathrooms} Bathrooms</span>
                    </div>
                  )}
                  {propertyData.sqft && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-primary" />
                      <span className="font-medium">{propertyData.sqft} Sq.ft</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-medium">Posted {propertyData.postedDate}</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {propertyData.highlights.map((highlight) => (
                    <span key={highlight} className="flex items-center gap-1.5 px-3 py-1.5 bg-price-light text-price rounded-full text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Collapsible Sections */}
                {/* Description */}
                <div className="bg-card rounded-2xl card-shadow overflow-hidden">
                  <button
                    onClick={() => toggleSection('description')}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <h2 className="text-xl font-semibold">Description</h2>
                    {expandedSections.description ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  {expandedSections.description && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                        {propertyData.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div className="bg-card rounded-2xl card-shadow overflow-hidden">
                  <button
                    onClick={() => toggleSection('amenities')}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <h2 className="text-xl font-semibold">Amenities</h2>
                    {expandedSections.amenities ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  {expandedSections.amenities && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {propertyData.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-price flex-shrink-0" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Map */}
                <div className="bg-card rounded-2xl card-shadow overflow-hidden">
                  <button
                    onClick={() => toggleSection('location')}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <h2 className="text-xl font-semibold">Location</h2>
                    {expandedSections.location ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  {expandedSections.location && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                          src={propertyData.mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0, minHeight: '300px' }}
                          allowFullScreen
                          loading="eager"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Property Location"
                        />
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(propertyData.area + ', ' + propertyData.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
                      >
                        <MapPin className="h-4 w-4" />
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Contact Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card rounded-2xl p-6 card-shadow space-y-4">
                  <h3 className="text-lg font-semibold">Interested in this property?</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact us today to schedule a visit or get more details.
                  </p>
                  
                  <div className="space-y-3">
                    <a href="tel:+916301575658" className="block">
                      <Button className="w-full call-btn py-6 rounded-xl font-semibold">
                        <Phone className="h-5 w-5 mr-2" />
                        Call Now
                      </Button>
                    </a>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full whatsapp-btn py-6 rounded-xl font-semibold">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                    {propertyData.brochureUrl && (
                      <a href={propertyData.brochureUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full py-6 rounded-xl font-semibold">
                          <FileText className="h-5 w-5 mr-2" />
                          Download Brochure
                        </Button>
                      </a>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">HA</span>
                      </div>
                      <div>
                        <p className="font-semibold">Houses Adda</p>
                        <p className="text-sm text-muted-foreground">Property Consultant</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar propertyTitle={propertyData.title} />
    </div>
  );
};

export default PropertyDetail;
