import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, Tag } from 'lucide-react';
import { typesAPI, locationsAPI } from '@/lib/api';

const budgetRanges = [
  { label: 'Any Budget', value: '' },
  { label: 'Under 25L', value: '0-2500000' },
  { label: '25L - 50L', value: '2500000-5000000' },
  { label: '50L - 75L', value: '5000000-7500000' },
  { label: '75L - 1Cr', value: '7500000-10000000' },
  { label: '1Cr - 2Cr', value: '10000000-20000000' },
  { label: '2Cr - 5Cr', value: '20000000-50000000' },
  { label: '5Cr+', value: '50000000-' },
];

const transactionTypes = [
  { label: 'Buy (Sale)', value: 'Sale' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Lease', value: 'Lease' },
  { label: 'PG', value: 'PG' },
];

export function SearchTabs() {
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('Sale');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load property types
      const types = await typesAPI.getAll();
      const typeNames = types.map((t: any) => t.name);
      setPropertyTypes(typeNames);
      
      // Load locations/areas
      const locations = await locationsAPI.getAll();
      const areaNames = locations.map((l: any) => l.name);
      setAreas(areaNames);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setPropertyTypes(['Apartment', 'Villa', 'Plot', 'Commercial']);
      setAreas(['Gachibowli', 'Hitech City', 'Kondapur', 'Madhapur']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Set transaction type
    if (selectedTransaction) {
      if (selectedTransaction === 'Sale') {
        params.set('intent', 'buy');
      } else if (selectedTransaction === 'Rent') {
        params.set('intent', 'rent');
      } else {
        params.set('transactionType', selectedTransaction);
      }
    }
    
    // Add area if selected
    if (selectedArea) {
      params.set('search', selectedArea);
    }
    
    // Add property type if selected
    if (selectedType) {
      params.set('type', selectedType);
    }
    
    // Add budget if selected
    if (selectedBudget) {
      params.set('budget', selectedBudget);
    }
    
    // Navigate to properties page with filters
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {/* Area Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase font-medium">Area</p>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none cursor-pointer appearance-none truncate"
                disabled={isLoading}
              >
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Home className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase font-medium">Type</p>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none cursor-pointer appearance-none truncate"
                disabled={isLoading}
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <IndianRupee className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase font-medium">Budget</p>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none cursor-pointer appearance-none truncate"
              >
                {budgetRanges.map((budget) => (
                  <option key={budget.value} value={budget.value}>{budget.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transaction Type Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Tag className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase font-medium">For</p>
              <select
                value={selectedTransaction}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none cursor-pointer appearance-none truncate"
              >
                {transactionTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <span className="text-sm text-gray-500">Popular:</span>
        {areas.slice(0, 5).map((area) => (
          <button
            key={area}
            onClick={() => {
              setSelectedArea(area);
              handleSearch();
            }}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
