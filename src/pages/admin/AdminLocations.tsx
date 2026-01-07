import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { locationsAPI, propertiesAPI } from '@/lib/api';

const AdminLocations = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLocation, setNewLocation] = useState({ name: '', city: 'Hyderabad' });
  const [editingLocation, setEditingLocation] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', city: '' });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await locationsAPI.getAll();
      setLocations(data);
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

  const getLocationPropertyCount = async (locationId: number) => {
    try {
      const props = await propertiesAPI.getAll({ active: true });
      return props.filter((p: any) => p.area === locations.find(l => l.id === locationId)?.name).length;
    } catch {
      return 0;
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
      toast({ title: "Location Added", description: `${newLocation.name} has been added successfully.` });
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
      toast({ title: "Location Deleted", variant: "destructive" });
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
      toast({ title: "Location Updated" });
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

  // Group locations by city
  const cities = Array.from(new Set(locations.map(l => l.city))).sort();
  const locationsByCity = cities.reduce((acc, city) => {
    acc[city] = locations.filter(l => l.city === city);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Locations</h1>
        <p className="text-muted-foreground">Add and manage cities and areas</p>
      </div>

      {/* Add New Location */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Add New Location
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input
            value={newLocation.name}
            onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Area/Locality name"
            className="rounded-xl"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <Input
            value={newLocation.city}
            onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
            placeholder="City"
            className="rounded-xl"
            onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          />
          <Button onClick={addLocation} className="accent-gradient">
            <Plus className="h-5 w-5 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Locations by City */}
      <div className="space-y-6">
        {cities.map((city) => (
          <div key={city} className="bg-card rounded-2xl p-6 card-shadow">
            <h2 className="text-lg font-semibold mb-4">{city}</h2>
            <div className="space-y-2">
              {locationsByCity[city].map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  {editingLocation === location.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1"
                        autoFocus
                      />
                      <Input
                        value={editData.city}
                        onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-muted-foreground">{location.city}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(location)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLocation(location.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {locations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No locations added yet. Add your first location above.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLocations;
