import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const initialTypes = [
  { id: '1', name: 'Apartment', description: '1, 2, 3, 4 BHK Flats', propertiesCount: 6 },
  { id: '2', name: 'Villa', description: 'Independent Houses', propertiesCount: 3 },
  { id: '3', name: 'Plot', description: 'HMDA Approved Lands', propertiesCount: 2 },
  { id: '4', name: 'Commercial', description: 'Office & Retail Spaces', propertiesCount: 1 },
];

const AdminTypes = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState(initialTypes);
  const [newType, setNewType] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const addType = () => {
    if (newType.trim()) {
      const id = Date.now().toString();
      setTypes(prev => [...prev, { 
        id, 
        name: newType.trim(), 
        description: newDescription.trim() || 'Property type',
        propertiesCount: 0 
      }]);
      setNewType('');
      setNewDescription('');
      toast({ title: "Property Type Added", description: `${newType} has been added successfully.` });
    }
  };

  const deleteType = (id: string) => {
    if (confirm('Delete this property type?')) {
      setTypes(prev => prev.filter(t => t.id !== id));
      toast({ title: "Property Type Deleted", variant: "destructive" });
    }
  };

  const startEdit = (type: typeof types[0]) => {
    setEditingId(type.id);
    setEditName(type.name);
    setEditDescription(type.description);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      setTypes(prev => prev.map(t => 
        t.id === editingId 
          ? { ...t, name: editName.trim(), description: editDescription.trim() }
          : t
      ));
      setEditingId(null);
      toast({ title: "Property Type Updated" });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Property Types</h1>
        <p className="text-muted-foreground">Manage property categories</p>
      </div>

      <div className="max-w-2xl">
        {/* Add New Type */}
        <div className="bg-card rounded-2xl p-6 card-shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Property Type
          </h2>
          <div className="space-y-3">
            <Input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Type name (e.g., Penthouse)"
              className="rounded-xl"
            />
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (e.g., Luxury top-floor apartments)"
              className="rounded-xl"
            />
            <Button onClick={addType} className="w-full accent-gradient">
              <Plus className="h-5 w-5 mr-2" />
              Add Property Type
            </Button>
          </div>
        </div>

        {/* Types List */}
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Existing Types</h2>
          <div className="space-y-3">
            {types.map((type) => (
              <div
                key={type.id}
                className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {editingId === type.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-xl"
                      autoFocus
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="rounded-xl"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{type.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {type.propertiesCount} properties
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(type)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteType(type.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTypes;
