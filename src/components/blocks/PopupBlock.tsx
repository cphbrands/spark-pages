import { Theme } from '@/lib/schemas';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopupBlockProps {
  heading: string;
  text?: string;
  ctaText?: string;
  ctaUrl?: string;
  trigger?: 'delay' | 'exit' | 'scroll';
  delaySeconds?: number;
  scrollPercent?: number;
  showOnce?: boolean;
  theme: Theme;
}

export function PopupBlock({ 
  heading, 
  text, 
  ctaText, 
  ctaUrl, 
  trigger = 'delay',
  delaySeconds = 5,
  scrollPercent = 50,
  showOnce = true,
  theme,
}: PopupBlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (showOnce && hasShown) return;

    const storageKey = `popup_shown_${heading.slice(0, 20)}`;
    if (showOnce && localStorage.getItem(storageKey)) return;

    if (trigger === 'delay') {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
        if (showOnce) localStorage.setItem(storageKey, 'true');
      }, delaySeconds * 1000);
      return () => clearTimeout(timer);
    }

    if (trigger === 'exit') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !hasShown) {
          setIsVisible(true);
          setHasShown(true);
          if (showOnce) localStorage.setItem(storageKey, 'true');
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }

    if (trigger === 'scroll') {
      const handleScroll = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled >= scrollPercent && !hasShown) {
          setIsVisible(true);
          setHasShown(true);
          if (showOnce) localStorage.setItem(storageKey, 'true');
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [trigger, delaySeconds, scrollPercent, showOnce, hasShown, heading]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative max-w-md w-full rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300"
        style={{
          backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#ffffff',
          color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
        }}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-5 h-5 opacity-60" />
        </button>

        <h3 
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
        >
          {heading}
        </h3>

        {text && (
          <p className="opacity-70 mb-6">{text}</p>
        )}

        {ctaText && (
          <a
            href={ctaUrl || '#'}
            onClick={() => setIsVisible(false)}
            className={cn(
              "inline-block px-6 py-3 font-semibold rounded-lg transition-all duration-300 hover:scale-105",
              theme.buttonStyle === 'solid' 
                ? "text-white shadow-lg" 
                : "border-2 bg-transparent"
            )}
            style={{
              backgroundColor: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
              borderColor: theme.primaryColor,
              color: theme.buttonStyle === 'solid' ? '#ffffff' : theme.primaryColor,
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
}