import { Building2, Home, Map, Store } from 'lucide-react';

const propertyTypes = [
  {
    name: 'Apartments',
    icon: Building2,
    count: 156,
    description: '1, 2, 3, 4 BHK Flats',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Villas',
    icon: Home,
    count: 48,
    description: 'Independent Houses',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    name: 'Plots',
    icon: Map,
    count: 72,
    description: 'HMDA Approved Lands',
    color: 'from-amber-500 to-amber-600',
  },
  {
    name: 'Commercial',
    icon: Store,
    count: 34,
    description: 'Office & Retail Spaces',
    color: 'from-purple-500 to-purple-600',
  },
];

export function BrowseByType() {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            What are you looking for?
          </h2>
          <p className="text-muted-foreground mt-2">
            Browse properties by type to find your perfect match
          </p>
        </div>

        {/* Type Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {propertyTypes.map((type) => (
            <a
              key={type.name}
              href={`/properties?type=${encodeURIComponent(type.name.toLowerCase())}`}
              className="group bg-card rounded-2xl p-6 md:p-8 card-shadow card-hover text-center"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${type.color} mb-4 group-hover:scale-110 transition-transform`}>
                <type.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
                {type.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
              <span className="text-sm font-medium text-primary">{type.count} Properties</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
