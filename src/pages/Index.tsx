import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { LatestProperties } from '@/components/LatestProperties';
import { BrowseByCity } from '@/components/BrowseByCity';
import { BrowseByType } from '@/components/BrowseByType';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        <HeroSection />
        <BrowseByType />
        <FeaturedProperties />
        <BrowseByCity />
        <LatestProperties />
        <WhyChooseUs />
      </main>

      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Mobile Bottom Action Bar */}
      <MobileActionBar />
    </div>
  );
};

export default Index;
