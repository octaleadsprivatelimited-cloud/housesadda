import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, ChevronDown, Check } from 'lucide-react';
import { supabaseTypesAPI, supabaseLocationsAPI } from '@/lib/supabase-api';

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

// Custom Dropdown Component
interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function CustomDropdown({ label, icon, value, options, onChange, placeholder = 'Select' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border-2 transition-all ${
          isOpen 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-100 hover:border-gray-200 bg-white'
        }`}
      >
        <span className={`flex-shrink-0 ${isOpen ? 'text-primary' : 'text-gray-400'}`}>{icon}</span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[10px] md:text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
          <p className={`text-xs md:text-sm font-medium truncate ${selectedOption?.label ? 'text-gray-800' : 'text-gray-400'}`}>
            {selectedOption?.label || placeholder}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-primary/5 text-primary' : 'text-gray-700'
              }`}
            >
              <span className="text-sm font-medium truncate">{option.label}</span>
              {value === option.value && <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchTabs() {
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState<{ label: string; value: string }[]>([]);
  const [areas, setAreas] = useState<{ label: string; value: string }[]>([]);
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
      const types = await supabaseTypesAPI.getAll();
      const typeOptions = [
        { label: 'All Types', value: '' },
        ...types.map((t: any) => ({ label: t.name, value: t.name }))
      ];
      setPropertyTypes(typeOptions);
      
      const locations = await supabaseLocationsAPI.getAll();
      const areaOptions = [
        { label: 'All Areas', value: '' },
        ...locations.map((l: any) => ({ label: l.name, value: l.name }))
      ];
      setAreas(areaOptions);
    } catch (error) {
      console.error('Error loading data:', error);
      setPropertyTypes([
        { label: 'All Types', value: '' },
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Villa', value: 'Villa' },
        { label: 'Plot', value: 'Plot' },
      ]);
      setAreas([
        { label: 'All Areas', value: '' },
        { label: 'Gachibowli', value: 'Gachibowli' },
        { label: 'Hitech City', value: 'Hitech City' },
      ]);
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
    
    if (selectedArea) params.set('area', selectedArea);
    if (selectedType) params.set('type', selectedType);
    if (selectedBudget) params.set('budget', selectedBudget);
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Transaction Type Tabs */}
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="inline-flex bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-white/20">
          {transactionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedTransaction(type.value)}
              className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedTransaction === type.value
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl shadow-gray-200/50 p-3 md:p-4 lg:p-5 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          {/* Area Dropdown */}
          <CustomDropdown
            label="Location"
            icon={<MapPin className="h-4 w-4" />}
            value={selectedArea}
            options={areas}
            onChange={setSelectedArea}
            placeholder="Select Area"
          />

          {/* Property Type Dropdown */}
          <CustomDropdown
            label="Property Type"
            icon={<Home className="h-4 w-4" />}
            value={selectedType}
            options={propertyTypes}
            onChange={setSelectedType}
            placeholder="Select Type"
          />

          {/* Budget Dropdown */}
          <CustomDropdown
            label="Budget"
            icon={<IndianRupee className="h-4 w-4" />}
            value={selectedBudget}
            options={budgetRanges}
            onChange={setSelectedBudget}
            placeholder="Any Budget"
          />

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white font-semibold py-3.5 md:py-3 px-6 md:px-8 rounded-lg md:rounded-xl transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] min-w-[120px] md:min-w-[140px] text-sm md:text-base whitespace-nowrap"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Popular Searches */}
      {areas.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-4 md:mt-5">
          <span className="text-xs md:text-sm text-white/80 font-medium">Popular:</span>
          {areas.slice(1, 6).map((area) => (
            <button
              key={area.value}
              onClick={() => {
                setSelectedArea(area.value);
                setTimeout(handleSearch, 100);
              }}
              className="px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm text-white/90 hover:text-white hover:bg-primary/90 bg-white/10 backdrop-blur-sm border border-white/30 hover:border-primary rounded-full transition-all shadow-sm"
            >
              {area.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
