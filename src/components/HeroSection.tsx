import { SearchTabs } from './SearchTabs';

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="container relative z-10 py-16">
        <div className="max-w-4xl mx-auto text-center mb-10">
          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Properties for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400" style={{ fontFamily: 'Georgia, serif' }}>
              Global Indian!
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover premium properties in Hyderabad - Apartments, Villas, Plots & Commercial spaces
          </p>
        </div>

        {/* Search Component */}
        <SearchTabs />
      </div>
    </section>
  );
}
