import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { typesAPI, propertiesAPI } from '@/lib/api';

const AdminTypes = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newType, setNewType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const data = await typesAPI.getAll();
      setTypes(data);
    } catch (error) {
      console.error('Error loading types:', error);
      toast({
        title: "Error",
        description: "Failed to load property types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypePropertyCount = async (typeName: string) => {
    try {
      const props = await propertiesAPI.getAll({ active: true, type: typeName });
      return props.length;
    } catch {
      return 0;
    }
  };

  const addType = async () => {
    if (!newType.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a type name",
        variant: "destructive",
      });
      return;
    }

    try {
      await typesAPI.create(newType.trim());
      toast({ title: "Property Type Added", description: `${newType} has been added successfully.` });
      setNewType('');
      await loadTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add property type",
        variant: "destructive",
      });
    }
  };

  const deleteType = async (id: number) => {
    if (!confirm('Delete this property type?')) return;

    try {
      await typesAPI.delete(id);
      toast({ title: "Property Type Deleted", variant: "destructive" });
      await loadTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property type",
        variant: "destructive",
      });
    }
  };

  const startEdit = (type: any) => {
    setEditingId(type.id);
    setEditName(type.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    try {
      await typesAPI.update(editingId, editName.trim());
      toast({ title: "Property Type Updated" });
      setEditingId(null);
      await loadTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property type",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

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
          <div className="flex gap-2">
            <Input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Type name (e.g., Penthouse)"
              className="rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && addType()}
            />
            <Button onClick={addType} className="accent-gradient">
              <Plus className="h-5 w-5 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Types List */}
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <h2 className="text-lg font-semibold mb-4">Existing Types</h2>
          <div className="space-y-3">
            {types.length > 0 ? (
              types.map((type) => (
                <div
                  key={type.id}
                  className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  {editingId === type.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-xl flex-1"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{type.name}</p>
                        </div>
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
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No property types added yet. Add your first type above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTypes;
