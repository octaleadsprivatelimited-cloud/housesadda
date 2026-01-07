import { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const initialCities = [
  { id: '1', name: 'Hyderabad', propertiesCount: 12 },
];

const initialAreas = [
  { id: '1', name: 'Gachibowli', cityId: '1', propertiesCount: 3 },
  { id: '2', name: 'Hitech City', cityId: '1', propertiesCount: 2 },
  { id: '3', name: 'Kondapur', cityId: '1', propertiesCount: 2 },
  { id: '4', name: 'Jubilee Hills', cityId: '1', propertiesCount: 1 },
  { id: '5', name: 'Banjara Hills', cityId: '1', propertiesCount: 1 },
  { id: '6', name: 'Madhapur', cityId: '1', propertiesCount: 1 },
  { id: '7', name: 'Kukatpally', cityId: '1', propertiesCount: 1 },
  { id: '8', name: 'Miyapur', cityId: '1', propertiesCount: 1 },
];

const AdminLocations = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState(initialCities);
  const [areas, setAreas] = useState(initialAreas);
  const [newCity, setNewCity] = useState('');
  const [newArea, setNewArea] = useState('');
  const [selectedCity, setSelectedCity] = useState('1');
  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [editingArea, setEditingArea] = useState<string | null>(null);

  const addCity = () => {
    if (newCity.trim()) {
      const id = Date.now().toString();
      setCities(prev => [...prev, { id, name: newCity.trim(), propertiesCount: 0 }]);
      setNewCity('');
      toast({ title: "City Added", description: `${newCity} has been added successfully.` });
    }
  };

  const addArea = () => {
    if (newArea.trim() && selectedCity) {
      const id = Date.now().toString();
      setAreas(prev => [...prev, { id, name: newArea.trim(), cityId: selectedCity, propertiesCount: 0 }]);
      setNewArea('');
      toast({ title: "Area Added", description: `${newArea} has been added successfully.` });
    }
  };

  const deleteCity = (id: string) => {
    if (confirm('Delete this city? This will also remove all associated areas.')) {
      setCities(prev => prev.filter(c => c.id !== id));
      setAreas(prev => prev.filter(a => a.cityId !== id));
      toast({ title: "City Deleted", variant: "destructive" });
    }
  };

  const deleteArea = (id: string) => {
    if (confirm('Delete this area?')) {
      setAreas(prev => prev.filter(a => a.id !== id));
      toast({ title: "Area Deleted", variant: "destructive" });
    }
  };

  const updateCity = (id: string, name: string) => {
    setCities(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    setEditingCity(null);
    toast({ title: "City Updated" });
  };

  const updateArea = (id: string, name: string) => {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, name } : a));
    setEditingArea(null);
    toast({ title: "Area Updated" });
  };

  const filteredAreas = areas.filter(a => a.cityId === selectedCity);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Locations</h1>
        <p className="text-muted-foreground">Add and manage cities and areas</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cities */}
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Cities
            </h2>
          </div>

          {/* Add City */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Add new city..."
              className="rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && addCity()}
            />
            <Button onClick={addCity} className="accent-gradient">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Cities List */}
          <div className="space-y-2">
            {cities.map((city) => (
              <div
                key={city.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                  selectedCity === city.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                }`}
                onClick={() => setSelectedCity(city.id)}
              >
                {editingCity === city.id ? (
                  <Input
                    defaultValue={city.name}
                    onBlur={(e) => updateCity(city.id, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && updateCity(city.id, (e.target as HTMLInputElement).value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 mr-2"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1">
                    <p className="font-medium">{city.name}</p>
                    <p className={`text-sm ${selectedCity === city.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {city.propertiesCount} properties
                    </p>
                  </div>
                )}
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCity(city.id)}
                    className={selectedCity === city.id ? 'hover:bg-primary-foreground/10' : ''}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCity(city.id)}
                    className={selectedCity === city.id ? 'hover:bg-primary-foreground/10 text-destructive' : 'text-destructive'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Areas in {cities.find(c => c.id === selectedCity)?.name || 'City'}
            </h2>
          </div>

          {/* Add Area */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Add new area..."
              className="rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && addArea()}
            />
            <Button onClick={addArea} className="accent-gradient">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Areas List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredAreas.length > 0 ? (
              filteredAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  {editingArea === area.id ? (
                    <Input
                      defaultValue={area.name}
                      onBlur={(e) => updateArea(area.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateArea(area.id, (e.target as HTMLInputElement).value)}
                      className="flex-1 mr-2"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1">
                      <p className="font-medium">{area.name}</p>
                      <p className="text-sm text-muted-foreground">{area.propertiesCount} properties</p>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingArea(area.id)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteArea(area.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No areas added yet. Add your first area above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocations;
