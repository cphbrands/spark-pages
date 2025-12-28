import { Theme } from '@/lib/schemas';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyBarBlockProps {
  text: string;
  ctaText?: string;
  ctaUrl?: string;
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  countdown?: boolean;
  countdownEndAt?: string;
  theme: Theme;
}

export function StickyBarBlock({ 
  text, 
  ctaText, 
  ctaUrl, 
  position = 'top',
  dismissible = true,
  countdown = false,
  countdownEndAt,
  theme,
}: StickyBarBlockProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!countdown || !countdownEndAt) return;

    const calculateTime = () => {
      const diff = new Date(countdownEndAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [countdown, countdownEndAt]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-40 px-4 py-3 animate-in slide-in-from-top duration-300",
        position === 'top' ? 'top-0' : 'bottom-0'
      )}
      style={{ backgroundColor: theme.primaryColor }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 flex-wrap">
        <p className="text-white font-medium text-center">
          {text}
          {countdown && timeLeft && (
            <span className="ml-2 font-mono bg-white/20 px-2 py-0.5 rounded">
              {timeLeft}
            </span>
          )}
        </p>

        {ctaText && (
          <a
            href={ctaUrl || '#'}
            className="px-4 py-1.5 bg-white rounded-lg font-semibold transition-all hover:scale-105"
            style={{ color: theme.primaryColor }}
          >
            {ctaText}
          </a>
        )}

        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}