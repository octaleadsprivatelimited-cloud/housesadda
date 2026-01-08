import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Loader2, Check, X, Search, Home, Store, Trees, Warehouse, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { typesAPI, propertiesAPI } from '@/lib/api';

// Icon mapping for property types
const getTypeIcon = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('apartment') || name.includes('flat')) return Home;
  if (name.includes('villa') || name.includes('house')) return Hotel;
  if (name.includes('plot') || name.includes('land')) return Trees;
  if (name.includes('commercial') || name.includes('shop') || name.includes('office')) return Store;
  if (name.includes('warehouse') || name.includes('farm')) return Warehouse;
  return Building2;
};

// Color mapping for property types
const getTypeColor = (typeName: string) => {
  const name = typeName.toLowerCase();
  if (name.includes('apartment') || name.includes('flat')) return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
  if (name.includes('villa') || name.includes('house')) return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' };
  if (name.includes('plot') || name.includes('land')) return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' };
  if (name.includes('commercial') || name.includes('shop') || name.includes('office')) return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' };
  if (name.includes('warehouse') || name.includes('farm')) return { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' };
  return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
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
      
      // Load property counts for each type
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
      toast({ title: "Success", description: `${newType} added successfully.` });
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
      toast({ title: "Deleted", description: "Property type removed", variant: "destructive" });
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
      toast({ title: "Updated", description: "Property type updated successfully" });
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

  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading property types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Property Types</h1>
          <p className="text-gray-500 text-sm">Manage property categories ({types.length} total)</p>
        </div>
      </div>

      {/* Add New Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          Add New Property Type
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Type name (e.g., Penthouse, Farmhouse)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addType()}
          />
          <Button onClick={addType} className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30">
            <Plus className="h-5 w-5 mr-2" />
            Add Type
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search property types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>
      </div>

      {/* Types Grid */}
      {filteredTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map((type) => {
            const IconComponent = getTypeIcon(type.name);
            const colors = getTypeColor(type.name);
            
            return (
              <div
                key={type.id}
                className={`bg-white rounded-xl shadow-sm border ${colors.border} overflow-hidden hover:shadow-md transition-all group`}
              >
                {editingId === type.id ? (
                  <div className="p-4">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-3"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={saveEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 ${colors.bg} rounded-xl`}>
                        <IconComponent className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(type)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteType(type.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 mb-1">{type.name}</h3>
                    
                    {propertyCount[type.name] !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 ${colors.bg} ${colors.text} text-xs font-medium rounded-full`}>
                          {propertyCount[type.name]} {propertyCount[type.name] === 1 ? 'property' : 'properties'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No property types found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? "Try adjusting your search" : "Add your first property type above"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminTypes;
