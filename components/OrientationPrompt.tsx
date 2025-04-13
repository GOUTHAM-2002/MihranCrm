'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react'; // Or a rotation icon if preferred

export default function OrientationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768; // Check for mobile screen width (adjust breakpoint if needed)
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setShowPrompt(isMobile && isPortrait);
    };

    // Initial check
    checkOrientation();

    // Listen for resize and orientation changes
    window.addEventListener('resize', checkOrientation);
    // Using resize usually covers orientation changes, but you could add:
    // window.addEventListener('orientationchange', checkOrientation);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener('resize', checkOrientation);
      // window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showPrompt) {
    return null; // Don't render anything if not needed
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 p-6 text-center backdrop-blur-sm sm:hidden">
      {/* Icon suggesting rotation */}
      <Smartphone className="w-12 h-12 mb-4 text-primary animate-pulse" /> 
      
      <p className="text-lg font-semibold text-foreground mb-2">
        Rotate Device
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        For the best experience, please rotate your device to landscape mode.
      </p>
    </div>
  );
} 