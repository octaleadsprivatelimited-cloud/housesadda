import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Loader2, X, Check, Building, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { locationsAPI, propertiesAPI } from '@/lib/api';

const AdminLocations = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<any[]>([]);
  const [propertyCount, setPropertyCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: '', city: 'Hyderabad' });
  const [editingLocation, setEditingLocation] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', city: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await locationsAPI.getAll();
      setLocations(data);
      
      // Load property counts
      const props = await propertiesAPI.getAll({ active: true });
      const counts: Record<string, number> = {};
      data.forEach((loc: any) => {
        counts[loc.name] = props.filter((p: any) => p.area === loc.name).length;
      });
      setPropertyCount(counts);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLocation = async () => {
    if (!newLocation.name.trim() || !newLocation.city.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and city",
        variant: "destructive",
      });
      return;
    }

    try {
      await locationsAPI.create(newLocation);
      toast({ title: "Success", description: `${newLocation.name} added successfully.` });
      setNewLocation({ name: '', city: 'Hyderabad' });
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add location",
        variant: "destructive",
      });
    }
  };

  const deleteLocation = async (id: number) => {
    if (!confirm('Delete this location?')) return;

    try {
      await locationsAPI.delete(id);
      toast({ title: "Deleted", description: "Location removed", variant: "destructive" });
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  const startEdit = (location: any) => {
    setEditingLocation(location.id);
    setEditData({ name: location.name, city: location.city });
  };

  const saveEdit = async () => {
    if (!editingLocation || !editData.name.trim()) return;

    try {
      await locationsAPI.update(editingLocation, editData);
      toast({ title: "Updated", description: "Location updated successfully" });
      setEditingLocation(null);
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingLocation(null);
    setEditData({ name: '', city: '' });
  };

  // Get unique cities and filter locations
  const cities = Array.from(new Set(locations.map(l => l.city))).sort();
  
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || loc.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  // Group filtered locations by city
  const locationsByCity = filteredLocations.reduce((acc, loc) => {
    if (!acc[loc.city]) acc[loc.city] = [];
    acc[loc.city].push(loc);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
          <p className="text-gray-500 text-sm">Manage cities and areas ({locations.length} total)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <Building className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{cities.length} Cities</span>
          </div>
        </div>
      </div>

      {/* Add New Location */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 bg-teal-100 rounded-lg">
            <MapPin className="h-5 w-5 text-teal-600" />
          </div>
          Add New Location
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            type="text"
            value={newLocation.name}
            onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Area/Locality name"
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <input
            type="text"
            value={newLocation.city}
            onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
            placeholder="City"
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <Button onClick={addLocation} className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30">
            <Plus className="h-5 w-5 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Locations by City */}
      <div className="space-y-6">
        {Object.entries(locationsByCity).sort().map(([city, cityLocations]) => (
          <div key={city} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{city}</h2>
                    <p className="text-xs text-gray-500">{cityLocations.length} areas</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cityLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  {editingLocation === location.id ? (
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        autoFocus
                      />
                      <input
                        value={editData.city}
                        onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      <button 
                        onClick={saveEdit}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-teal-100 transition-colors">
                          <MapPin className="h-4 w-4 text-gray-500 group-hover:text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{location.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{location.city}</span>
                            {propertyCount[location.name] > 0 && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {propertyCount[location.name]} properties
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(location)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteLocation(location.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredLocations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No locations found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCity !== 'all' 
                ? "Try adjusting your search or filters" 
                : "Add your first location above"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLocations;
