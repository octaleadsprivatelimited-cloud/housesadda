import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee } from 'lucide-react';
import { typesAPI } from '@/lib/api';

const budgetRanges = ['Budget', 'Under 50L', '50L - 1Cr', '1Cr - 2Cr', '2Cr+'];

interface SearchTabsProps {
  activeTab?: string;
}

export function SearchTabs({ activeTab = 'buy' }: SearchTabsProps) {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('Budget');
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    loadPropertyTypes();
  }, []);

  const loadPropertyTypes = async () => {
    try {
      const types = await typesAPI.getAll();
      const typeNames = types.map((t: any) => t.name);
      setPropertyTypes(typeNames);
      if (typeNames.length > 0) {
        setSelectedType(typeNames[0]);
      }
    } catch (error) {
      console.error('Error loading property types:', error);
      setPropertyTypes(['Apartment', 'Villa', 'Plot', 'Commercial']);
      setSelectedType('Apartment');
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Set intent based on current tab
    if (currentTab === 'buy') {
      params.set('intent', 'buy');
    } else if (currentTab === 'rent') {
      params.set('intent', 'rent');
    } else if (currentTab === 'pg') {
      params.set('intent', 'pg');
    } else if (currentTab === 'new' || currentTab === 'plot' || currentTab === 'commercial') {
      params.set('type', currentTab);
    }
    
    // Add property type if selected
    if (selectedType) {
      params.set('type', selectedType);
    }
    
    // Add search location if entered
    if (searchLocation.trim()) {
      params.set('search', searchLocation.trim());
    }
    
    // Navigate to properties page with filters
    navigate(`/properties?${params.toString()}`);
  };

  const tabs = [
    { id: 'buy', label: 'Buy' },
    { id: 'rent', label: 'Rent' },
    { id: 'new', label: 'New Projects' },
    { id: 'pg', label: 'PG' },
    { id: 'plot', label: 'Plot' },
    { id: 'commercial', label: 'Commercial' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              currentTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-transparent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-search-container">
        {/* City/Location */}
        <div className="flex items-center gap-2 px-4 py-2 min-w-[140px]">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">City</p>
            <input
              type="text"
              placeholder="Hyderabad"
              className="mb-search-input w-full font-medium"
            />
          </div>
        </div>

        <div className="mb-search-divider" />

        {/* Location Search */}
        <div className="flex-1 px-4 py-2">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Add more... Locality, Area, Project"
            className="mb-search-input w-full"
          />
        </div>

        <div className="mb-search-divider" />

        {/* Property Type */}
        <div className="flex items-center gap-2 px-4 py-2 min-w-[120px]">
          <Home className="h-5 w-5 text-muted-foreground" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mb-search-input cursor-pointer font-medium appearance-none bg-transparent pr-4"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="mb-search-divider" />

        {/* Budget */}
        <div className="flex items-center gap-2 px-4 py-2 min-w-[100px]">
          <IndianRupee className="h-5 w-5 text-muted-foreground" />
          <select
            value={selectedBudget}
            onChange={(e) => setSelectedBudget(e.target.value)}
            className="mb-search-input cursor-pointer font-medium appearance-none bg-transparent pr-4"
          >
            {budgetRanges.map((budget) => (
              <option key={budget} value={budget}>{budget}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          className="mb-search-btn flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          Search
        </button>
      </div>
    </div>
  );
}
