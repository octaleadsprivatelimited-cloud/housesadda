import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, ChevronDown } from 'lucide-react';
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
  { label: 'Buy', value: 'Sale' },
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
      const types = await typesAPI.getAll();
      const typeNames = types.map((t: any) => t.name);
      setPropertyTypes(typeNames);
      
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
    
    if (selectedTransaction) {
      if (selectedTransaction === 'Sale') {
        params.set('intent', 'buy');
      } else if (selectedTransaction === 'Rent') {
        params.set('intent', 'rent');
      } else {
        params.set('transactionType', selectedTransaction);
      }
    }
    
    if (selectedArea) {
      params.set('search', selectedArea);
    }
    
    if (selectedType) {
      params.set('type', selectedType);
    }
    
    if (selectedBudget) {
      params.set('budget', selectedBudget);
    }
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Transaction Type Tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white rounded-full p-1 shadow-md">
          {transactionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedTransaction(type.value)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTransaction === type.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Area Dropdown */}
          <div className="flex-1 relative group">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-primary/30 focus-within:border-primary transition-colors bg-gray-50/50">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Location</label>
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full text-gray-800 font-medium bg-transparent outline-none cursor-pointer appearance-none pr-6"
                    disabled={isLoading}
                  >
                    <option value="">Select Area</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-primary/30 focus-within:border-primary transition-colors bg-gray-50/50">
              <Home className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Property Type</label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full text-gray-800 font-medium bg-transparent outline-none cursor-pointer appearance-none pr-6"
                    disabled={isLoading}
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Budget Dropdown */}
          <div className="flex-1 relative">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-primary/30 focus-within:border-primary transition-colors bg-gray-50/50">
              <IndianRupee className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Budget</label>
                <div className="relative">
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full text-gray-800 font-medium bg-transparent outline-none cursor-pointer appearance-none pr-6"
                  >
                    {budgetRanges.map((budget) => (
                      <option key={budget.value} value={budget.value}>{budget.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          >
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      {/* Popular Searches */}
      {areas.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="text-sm text-gray-400">Popular:</span>
          {areas.slice(0, 5).map((area) => (
            <button
              key={area}
              onClick={() => {
                setSelectedArea(area);
                setTimeout(handleSearch, 100);
              }}
              className="px-3 py-1 text-sm text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
            >
              {area}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
