import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Commercial'];
const cities = ['Hyderabad'];
const areas = ['Gachibowli', 'Hitech City', 'Kondapur', 'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Kukatpally', 'Miyapur', 'Kompally', 'Financial District', 'Shamirpet'];

const PropertyForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    city: 'Hyderabad',
    area: '',
    price: '',
    priceUnit: 'onwards',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    brochureUrl: '',
    mapUrl: '',
    isFeatured: false,
    isActive: true,
    amenities: [] as string[],
    highlights: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In production, you would upload to your server and get URLs back
      // For demo, we're using placeholder URLs
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, newAmenity.trim()] }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    if (!formData.title || !formData.area || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Property Added!",
      description: "Your property has been successfully added.",
    });

    navigate('/admin/properties');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Add New Property</h1>
          <p className="text-muted-foreground">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Property Title *</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Luxury 3 BHK Apartment in Gachibowli"
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Property Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Area / Locality *</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card"
              required
            >
              <option value="">Select Area</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Pricing & Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Price (₹) *</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 15000000"
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price Unit</label>
              <select
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card"
              >
                <option value="onwards">Onwards</option>
                <option value="negotiable">Negotiable</option>
                <option value="all inclusive">All Inclusive</option>
                <option value="per sqft">Per Sq.ft</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Bedrooms</label>
              <Input
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="e.g., 3"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bathrooms</label>
              <Input
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="e.g., 3"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Area (sq.ft)</label>
              <Input
                name="sqft"
                type="number"
                value={formData.sqft}
                onChange={handleChange}
                placeholder="e.g., 2100"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the property in detail..."
              rows={5}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Property Images</h2>
          
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Click to upload images</p>
              <p className="text-sm text-muted-foreground">JPG, PNG up to 1MB each</p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brochure & Map */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Links</h2>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Brochure URL (Google Drive)</label>
            <Input
              name="brochureUrl"
              value={formData.brochureUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/file/d/..."
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">Paste your Google Drive brochure link</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Google Maps Embed URL</label>
            <Input
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleChange}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground mt-1">Get embed URL from Google Maps → Share → Embed</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Amenities</h2>
          
          <div className="flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="e.g., Swimming Pool"
              className="rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
            />
            <Button type="button" onClick={addAmenity} variant="outline">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {formData.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm">
                  {amenity}
                  <button type="button" onClick={() => removeAmenity(index)} className="hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Highlights</h2>
          
          <div className="flex gap-2">
            <Input
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="e.g., Ready to Move"
              className="rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
            />
            <Button type="button" onClick={addHighlight} variant="outline">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {formData.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.highlights.map((highlight, index) => (
                <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-price-light text-price rounded-full text-sm">
                  {highlight}
                  <button type="button" onClick={() => removeHighlight(index)} className="hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl p-6 card-shadow space-y-5">
          <h2 className="text-lg font-semibold">Settings</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mark as Featured</p>
              <p className="text-sm text-muted-foreground">Show in featured section on homepage</p>
            </div>
            <Switch
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Active Listing</p>
              <p className="text-sm text-muted-foreground">Property visible on website</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="accent-gradient text-accent-foreground font-semibold px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Add Property'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
