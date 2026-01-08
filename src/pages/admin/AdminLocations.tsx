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
      toast({ title: "Success", description: `${newLocation.name} added` });
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
      toast({ title: "Deleted", variant: "destructive" });
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
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
      toast({ title: "Updated" });
      setEditingLocation(null);
      await loadLocations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingLocation(null);
    setEditData({ name: '', city: '' });
  };

  const cities = Array.from(new Set(locations.map(l => l.city))).sort();
  
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || loc.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const locationsByCity = filteredLocations.reduce((acc, loc) => {
    if (!acc[loc.city]) acc[loc.city] = [];
    acc[loc.city].push(loc);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Locations</h1>
          <p className="text-gray-500 text-xs">{locations.length} locations • {cities.length} cities</p>
        </div>
      </div>

      {/* Add New + Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newLocation.name}
            onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Area name"
            className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <input
            type="text"
            value={newLocation.city}
            onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
            placeholder="City"
            className="w-32 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <Button onClick={addLocation} size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-primary outline-none"
          >
            <option value="all">All</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Locations Grid by City */}
      {Object.entries(locationsByCity).sort().map(([city, cityLocations]) => (
        <div key={city} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Building className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">{city}</span>
            <span className="text-xs text-gray-400">({cityLocations.length})</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {cityLocations.map((location) => (
              editingLocation === location.id ? (
                <div key={location.id} className="flex items-center gap-1 p-1 bg-white rounded-lg border border-blue-300 shadow-sm">
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs rounded border border-gray-200 outline-none focus:border-primary"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <input
                    value={editData.city}
                    onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-20 px-2 py-1 text-xs rounded border border-gray-200 outline-none focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check className="h-3 w-3" />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  key={location.id}
                  className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all cursor-default"
                >
                  <MapPin className="h-3 w-3 text-gray-400 group-hover:text-teal-500" />
                  <span className="text-sm text-gray-700">{location.name}</span>
                  {propertyCount[location.name] > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-medium rounded-full">
                      {propertyCount[location.name]}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <button 
                      onClick={() => startEdit(location)}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => deleteLocation(location.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      ))}
      
      {filteredLocations.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No locations found</p>
        </div>
      )}
    </div>
  );
};

export default AdminLocations;
