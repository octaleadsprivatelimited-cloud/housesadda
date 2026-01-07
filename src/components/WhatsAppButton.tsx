import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent("Hi Houses Adda, I'm interested in your properties.")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 group"
    >
      <div className="relative">
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full whatsapp-btn animate-ping opacity-40"></span>
        
        {/* Button */}
        <div className="relative flex items-center gap-2 whatsapp-btn px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
          <MessageCircle className="h-6 w-6" />
          <span className="hidden md:inline font-medium">Chat with us</span>
        </div>
      </div>
    </a>
  );
}
