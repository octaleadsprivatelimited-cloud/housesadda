import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Loader2, Check, X, Search, Home, Store, Trees, Warehouse, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { typesAPI, propertiesAPI } from '@/lib/api';

const getTypeIcon = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('apartment') || name.includes('flat')) return Home;
  if (name.includes('villa') || name.includes('house')) return Hotel;
  if (name.includes('plot') || name.includes('land')) return Trees;
  if (name.includes('commercial') || name.includes('shop') || name.includes('office')) return Store;
  if (name.includes('warehouse') || name.includes('farm')) return Warehouse;
  return Building2;
};

const getTypeColor = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('apartment') || name.includes('flat')) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
  if (name.includes('villa') || name.includes('house')) return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
  if (name.includes('plot') || name.includes('land')) return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
  if (name.includes('commercial') || name.includes('shop') || name.includes('office')) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
  if (name.includes('warehouse') || name.includes('farm')) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
  return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
};

const AdminTypes = () => {
  const { toast } = useToast();
  const [types, setTypes] = useState<any[]>([]);
  const [propertyCount, setPropertyCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newType, setNewType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setIsLoading(true);
      const data = await typesAPI.getAll();
      setTypes(data);
      
      const counts: Record<string, number> = {};
      for (const type of data) {
        try {
          const props = await propertiesAPI.getAll({ active: true, type: type.name });
          counts[type.name] = props.length;
        } catch {
          counts[type.name] = 0;
        }
      }
      setPropertyCount(counts);
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
      toast({ title: "Success", description: `${newType} added` });
      setNewType('');
      await loadTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add",
        variant: "destructive",
      });
    }
  };

  const deleteType = async (id: number) => {
    if (!confirm('Delete this property type?')) return;

    try {
      await typesAPI.delete(id);
      toast({ title: "Deleted", variant: "destructive" });
      await loadTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
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
      toast({ title: "Updated" });
      setEditingId(null);
      await loadTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Types</h1>
          <p className="text-gray-500 text-sm">{types.length} categories</p>
        </div>
      </div>

      {/* Add New + Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Type name (e.g., Penthouse)"
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
            onKeyPress={(e) => e.key === 'Enter' && addType()}
          />
          <Button onClick={addType} className="bg-purple-500 hover:bg-purple-600 text-white px-5">
            <Plus className="h-5 w-5 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Types Grid - Compact Blocks */}
      {filteredTypes.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {filteredTypes.map((type) => {
            const IconComponent = getTypeIcon(type.name);
            const colors = getTypeColor(type.name);
            
            return editingId === type.id ? (
              <div key={type.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border-2 border-purple-400 shadow-sm">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-32 px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-primary"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                />
                <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={cancelEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                key={type.id}
                className={`group flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border ${colors.border} hover:shadow-md transition-all cursor-default`}
              >
                <div className={`p-1.5 ${colors.bg} rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${colors.text}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{type.name}</span>
                {propertyCount[type.name] > 0 && (
                  <span className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}>
                    {propertyCount[type.name]}
                  </span>
                )}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <button 
                    onClick={() => startEdit(type)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteType(type.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base text-gray-500">No property types found</p>
        </div>
      )}
    </div>
  );
};

export default AdminTypes;
