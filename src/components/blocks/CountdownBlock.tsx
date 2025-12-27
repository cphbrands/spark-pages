import { Theme } from '@/lib/schemas';
import { useState, useEffect } from 'react';

interface CountdownBlockProps {
  endAt: string;
  label?: string;
  scarcityText?: string;
  theme: Theme;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownBlock({ endAt, label, scarcityText, theme }: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endAt).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endAt]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div 
      className="flex flex-col items-center p-4 rounded-xl min-w-[80px]"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#334155' : '#ffffff',
        boxShadow: theme.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.3)' 
          : '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <span 
        className="text-4xl md:text-5xl font-bold"
        style={{ color: theme.primaryColor }}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-sm uppercase tracking-wide opacity-60 mt-1">{label}</span>
    </div>
  );

  return (
    <section 
      className="px-4 py-16"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        {label && (
          <h3 
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {label}
          </h3>
        )}
        
        {isExpired ? (
          <div className="text-2xl font-semibold opacity-70">Offer has ended</div>
        ) : (
          <div className="flex justify-center gap-4 flex-wrap">
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hours" />
            <TimeBox value={timeLeft.minutes} label="Minutes" />
            <TimeBox value={timeLeft.seconds} label="Seconds" />
          </div>
        )}
        
        {scarcityText && !isExpired && (
          <p 
            className="mt-6 text-lg font-medium"
            style={{ color: theme.primaryColor }}
          >
            {scarcityText}
          </p>
        )}
      </div>
    </section>
  );
}
