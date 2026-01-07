import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileActionBarProps {
  propertyTitle?: string;
}

export function MobileActionBar({ propertyTitle }: MobileActionBarProps) {
  const whatsappMessage = propertyTitle
    ? `Hi Houses Adda, I'm interested in this property: ${propertyTitle}`
    : "Hi Houses Adda, I'm interested in your properties.";
  
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="mobile-action-bar md:hidden">
      <a href="tel:+916301575658" className="flex-1">
        <Button className="w-full call-btn py-3 rounded-xl">
          <Phone className="h-5 w-5 mr-2" />
          Call Now
        </Button>
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
        <Button className="w-full whatsapp-btn py-3 rounded-xl">
          <MessageCircle className="h-5 w-5 mr-2" />
          WhatsApp
        </Button>
      </a>
    </div>
  );
}
