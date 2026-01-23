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
      <div className="container relative z-10 py-12 md:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center mb-8 md:mb-10 lg:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 md:px-4 py-1.5 md:py-2 mb-4 md:mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white/90 text-xs md:text-sm font-medium">Find Your Dream Property Today</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight px-4">
            Properties for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400" style={{ fontFamily: 'Georgia, serif' }}>
              Global Indian!
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base md:text-lg lg:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Discover premium properties in Hyderabad - Apartments, Villas, Plots & Commercial spaces
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8 md:mb-10">
            <div className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">500+</div>
              <div className="text-white/60 text-xs md:text-sm">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">50+</div>
              <div className="text-white/60 text-xs md:text-sm">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">1000+</div>
              <div className="text-white/60 text-xs md:text-sm">Happy Clients</div>
            </div>
          </div>
        </div>

        {/* Search Component */}
        <SearchTabs />
      </div>
    </section>
  );
}
