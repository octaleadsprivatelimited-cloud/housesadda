import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { PropertyCard, Property } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  Building2,
  CheckCircle2,
  Star,
  Download,
  Play,
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getById(id!);
      setProperty(data);
      if (data.images && data.images.length > 0) {
        setCurrentImage(0);
      }
      // Load similar properties after main property is loaded
      // Use setTimeout to avoid blocking the main property load
      setTimeout(() => {
        loadSimilarProperties(data).catch(err => {
          console.error('Failed to load similar properties:', err);
        });
      }, 500);
    } catch (error) {
      console.error('Error loading property:', error);
      navigate('/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimilarProperties = async (currentProperty: any) => {
    try {
      setIsLoadingSimilar(true);
      const transactionType = currentProperty.transactionType || 'Sale';
      const areaToFilter = currentProperty.area || currentProperty.location_name;
      const propertyType = currentProperty.type;
      const city = currentProperty.city || 'Hyderabad';
      
      let similarData: any[] = [];
      
      // Strategy 1: Same area + same transaction type
      if (areaToFilter) {
        const areaData = await propertiesAPI.getAll({
          active: true,
          transactionType: transactionType,
          area: areaToFilter,
        });
        similarData = areaData.filter((p: any) => String(p.id) !== String(currentProperty.id));
      }
      
      // Strategy 2: If not enough, try same property type + transaction type
      if (similarData.length < 6 && propertyType) {
        const typeData = await propertiesAPI.getAll({
          active: true,
          transactionType: transactionType,
          type: propertyType,
        });
        const typeFiltered = typeData.filter((p: any) => 
          String(p.id) !== String(currentProperty.id) && 
          !similarData.some(s => String(s.id) === String(p.id))
        );
        similarData = [...similarData, ...typeFiltered].slice(0, 6);
      }
      
      // Strategy 3: If still not enough, try same transaction type only
      if (similarData.length < 6) {
        const transactionData = await propertiesAPI.getAll({
          active: true,
          transactionType: transactionType,
        });
        const transactionFiltered = transactionData.filter((p: any) => 
          String(p.id) !== String(currentProperty.id) && 
          !similarData.some(s => String(s.id) === String(p.id))
        );
        similarData = [...similarData, ...transactionFiltered].slice(0, 6);
      }
      
      // Strategy 4: If still not enough, get any active properties
      if (similarData.length < 3) {
        const allData = await propertiesAPI.getAll({ active: true });
        const allFiltered = allData.filter((p: any) => 
          String(p.id) !== String(currentProperty.id) && 
          !similarData.some(s => String(s.id) === String(p.id))
        );
        similarData = [...similarData, ...allFiltered].slice(0, 6);
      }
      
      // Transform to Property format
      const similar = similarData.slice(0, 6).map((prop: any) => ({
        id: String(prop.id),
        title: prop.title,
        type: prop.type || 'Apartment',
        city: prop.city || 'Hyderabad',
        area: prop.area || '',
        price: prop.price,
        priceUnit: 'onwards',
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.sqft,
        image: prop.image || prop.images?.[0] || '',
        imageCount: prop.images?.length || 0,
        isFeatured: prop.isFeatured,
        isVerified: true,
        brochureUrl: prop.brochureUrl,
      }));
      
      setSimilarProperties(similar);
    } catch (error) {
      console.error('Error loading similar properties:', error);
      setSimilarProperties([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Property not found</h2>
            <Link to="/properties">
              <Button>Back to Properties</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) videoId = shortMatch[1];
    
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) videoId = watchMatch[1];
    
    // youtube.com/v/VIDEO_ID
    const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]+)/);
    if (vMatch) videoId = vMatch[1];
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return null;
  };

  const propertyData = {
    id: property.id,
    title: property.title,
    type: property.type,
    city: property.city || 'Hyderabad',
    area: property.area,
    price: property.price,
    priceUnit: 'onwards',
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    isFeatured: property.isFeatured,
    brochureUrl: property.brochureUrl,
    videoUrl: property.videoUrl,
    images: property.images && property.images.length > 0 
      ? property.images 
      : property.image 
        ? [property.image] 
        : ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&q=80'],
    description: property.description || 'No description available.',
    amenities: property.amenities || [],
    highlights: property.highlights || [],
    mapUrl: property.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30452.68657654982!2d78.34!3d17.44!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688beb557fa0ee!2sGachibowli%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1704067200000!5m2!1sen!2sin',
    postedDate: property.createdAt || new Date().toISOString().split('T')[0],
    transactionType: property.transactionType || 'Sale',
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Crore`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatPriceShort = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${(price / 1000000).toFixed(2)} M`;
  };

  const nextImage = () => {
    if (propertyData.images.length > 0) {
      setCurrentImage((prev) => (prev + 1) % propertyData.images.length);
    }
  };

  const prevImage = () => {
    if (propertyData.images.length > 0) {
      setCurrentImage((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
    }
  };

  const whatsappMessage = `Hi Houses Adda, I'm interested in this property: ${propertyData.title} in ${propertyData.area}, ${propertyData.city}. Price: ${formatPrice(propertyData.price)}`;
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent(whatsappMessage)}`;

  const displayedImages = showAllImages ? propertyData.images : propertyData.images.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pb-24 md:pb-0">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="container">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to="/properties" className="text-gray-600 hover:text-primary">Properties</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">{propertyData.title}</span>
            </div>
          </div>
        </div>

        <div className="container py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative aspect-[16/10] bg-gray-100">
                  <img
                    src={propertyData.images[currentImage]}
                    alt={`${propertyData.title} - Image ${currentImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {propertyData.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors z-10"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors z-10"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {propertyData.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                      {currentImage + 1} / {propertyData.images.length}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors">
                      <Share2 className="h-5 w-5 text-gray-800" />
                    </button>
                    <button className="p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors">
                      <Heart className="h-5 w-5 text-gray-800" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {propertyData.images.length > 1 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {displayedImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImage(index)}
                          className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                            index === currentImage 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-gray-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {propertyData.images.length > 5 && !showAllImages && (
                        <button
                          onClick={() => setShowAllImages(true)}
                          className="flex-shrink-0 w-20 h-14 rounded-md border-2 border-gray-200 border-dashed flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                        >
                          <span className="text-xs font-medium">+{propertyData.images.length - 5}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {propertyData.transactionType}
                      </span>
                      {propertyData.isFeatured && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{propertyData.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{propertyData.area}, {propertyData.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                      {formatPrice(propertyData.price)}
                    </div>
                    {propertyData.sqft && (
                      <div className="text-sm text-gray-600">
                        ₹{Math.round(propertyData.price / propertyData.sqft).toLocaleString('en-IN')} per sqft
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  {propertyData.bedrooms > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Bed className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                        <div className="font-semibold text-gray-900">{propertyData.bedrooms} BHK</div>
                      </div>
                    </div>
                  )}
                  {propertyData.bathrooms > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Bath className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                        <div className="font-semibold text-gray-900">{propertyData.bathrooms}</div>
                      </div>
                    </div>
                  )}
                  {propertyData.sqft > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Square className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Area</div>
                        <div className="font-semibold text-gray-900">{propertyData.sqft.toLocaleString('en-IN')} sqft</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="font-semibold text-gray-900">{propertyData.type}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {propertyData.highlights && propertyData.highlights.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Key Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {propertyData.highlights.map((highlight: string, index: number) => (
                      <span 
                        key={index} 
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                  {propertyData.description}
                </div>
              </div>

              {/* Property Video */}
              {propertyData.videoUrl && getYouTubeEmbedUrl(propertyData.videoUrl) && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Play className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Property Video</h2>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                      src={getYouTubeEmbedUrl(propertyData.videoUrl)!}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                      title="Property Video"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Amenities */}
              {propertyData.amenities && propertyData.amenities.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {propertyData.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                {propertyData.mapUrl && propertyData.mapUrl.includes('google.com/maps/embed') ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <iframe
                      src={propertyData.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Property Location"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 mb-4 flex flex-col items-center justify-center">
                    <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                      <MapPin className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{propertyData.area}</h3>
                    <p className="text-gray-600 mb-4">{propertyData.city}</p>
                    <a
                      href={propertyData.mapUrl && propertyData.mapUrl.includes('google.com/maps') 
                        ? propertyData.mapUrl 
                        : `https://www.google.com/maps/search/${encodeURIComponent(propertyData.area + ', ' + propertyData.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      <MapPin className="h-4 w-4" />
                      Open in Google Maps
                    </a>
                  </div>
                )}
                <a
                  href={propertyData.mapUrl && propertyData.mapUrl.includes('google.com/maps') 
                    ? propertyData.mapUrl 
                    : `https://www.google.com/maps/search/${encodeURIComponent(propertyData.area + ', ' + propertyData.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  View on Google Maps
                </a>
              </div>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Contact Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatPrice(propertyData.price)}
                    </div>
                    {propertyData.sqft && (
                      <div className="text-sm text-gray-600">
                        ₹{Math.round(propertyData.price / propertyData.sqft).toLocaleString('en-IN')} per sqft
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <a href="tel:+916301575658" className="block">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-semibold rounded-lg">
                        <Phone className="h-5 w-5 mr-2" />
                        Call Owner
                      </Button>
                    </a>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-6 text-base font-semibold rounded-lg">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                    {propertyData.brochureUrl && (
                      <a href={propertyData.brochureUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full py-6 text-base font-semibold rounded-lg border-2">
                          <Download className="h-5 w-5 mr-2" />
                          Download Brochure
                        </Button>
                      </a>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">HA</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Houses Adda</p>
                        <p className="text-sm text-gray-600">Property Consultant</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium text-gray-700">4.8</span>
                          <span className="text-sm text-gray-500">(120 reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Info Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID</span>
                      <span className="font-medium text-gray-900">#{propertyData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Posted On</span>
                      <span className="font-medium text-gray-900">
                        {new Date(propertyData.postedDate).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Type</span>
                      <span className="font-medium text-gray-900">{propertyData.transactionType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="container py-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Similar Properties {propertyData.area ? `in ${propertyData.area}` : ''}
              </h2>
              <p className="text-gray-600 mb-6">
                {propertyData.transactionType === 'Sale' ? 'Properties for Sale' : 
                 propertyData.transactionType === 'Rent' ? 'Properties for Rent' : 
                 `${propertyData.transactionType} Properties`} you might be interested in
              </p>
              
              {isLoadingSimilar ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-3 text-gray-600">Loading similar properties...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarProperties.map((prop) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>
              )}
              
              {similarProperties.length > 0 && (
                <div className="mt-6 text-center">
                  <Link to={`/properties?intent=${propertyData.transactionType === 'Sale' ? 'buy' : 'rent'}${propertyData.area ? `&search=${encodeURIComponent(propertyData.area)}` : ''}`}>
                    <Button variant="outline" className="px-6">
                      View More {propertyData.transactionType === 'Sale' ? 'Sale' : propertyData.transactionType} Properties
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar propertyTitle={propertyData.title} />
    </div>
  );
};

export default PropertyDetail;
