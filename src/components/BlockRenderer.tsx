import { useEffect, useState } from 'react';
import { Block, Theme } from '@/lib/schemas';
import {
  HeroBlock,
  FeaturesBlock,
  BenefitsBlock,
  SocialProofBlock,
  PricingBlock,
  CountdownBlock as LegacyCountdownBlock,
  FAQBlock,
  ImageGalleryBlock,
  GuaranteeBlock,
  CTASectionBlock,
  FooterBlock,
  FormBlock,
  PopupBlock,
  StickyBarBlock as LegacyStickyBarBlock,
} from '@/components/blocks';

// Countdown with live ticking, defaults to 24h from now when no deadline provided
function UrgencyCountdownBlock({ deadline, label }: { deadline: string; label?: string }) {
  function calculateTimeLeft(endTime: string) {
    const difference = new Date(endTime).getTime() - new Date().getTime();
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    return {
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="countdown-timer p-6 my-4">
      <div className="text-lg font-bold mb-2">
        {label || '⏰ OFFER EXPIRES IN:'}
      </div>
      <div className="countdown-numbers">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
      <div className="text-sm mt-2 opacity-80">
        Prices increase when timer hits zero!
      </div>
    </div>
  );
}

// Sticky bar cycling fake notifications
function FakeStickyBar({ text, cta }: { text?: string; cta?: string }) {
  const messages = text
    ? [text]
    : [
        '🔥 Sarah from NYC just purchased!',
        '🚀 Michael upgraded to PRO plan',
        '🎯 Limited spots: Only 5 left!',
      ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="sticky-bar">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">🔴</span>
          <span className="font-medium">{messages[currentIndex]}</span>
        </div>
        {cta && (
          <button className="bg-white text-purple-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100 transition">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

// Price deception / anchoring block
function PriceDeceptionBlock({
  originalPrice,
  currentPrice,
  bonuses = [],
}: {
  originalPrice: number;
  currentPrice: number;
  bonuses?: string[];
}) {
  const savingsPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  return (
    <div className="price-deception my-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">WAS</div>
          <div className="original-price">${originalPrice}</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">NOW ONLY</div>
          <div className="current-price">${currentPrice}</div>
          <div className="savings-badge mt-2">SAVE {savingsPercent}%</div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">BREAKS DOWN TO</div>
          <div className="text-xl font-bold">${(currentPrice / 30).toFixed(2)}/day</div>
          <div className="text-xs text-gray-500">(Less than a coffee!)</div>
        </div>
      </div>

      {bonuses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="font-bold mb-2">🎁 FREE BONUSES INCLUDED:</div>
          <ul className="list-disc pl-5 text-sm">
            {bonuses.map((bonus, idx) => (
              <li key={idx}>{bonus}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface BlockRendererProps {
  block: Block;
  theme: Theme;
  pageId?: string;
  pageSlug?: string;
  onLeadSubmit?: (data: { name: string; email: string; phone?: string }) => Promise<void>;
}

export function BlockRenderer({ block, theme, pageId, pageSlug, onLeadSubmit }: BlockRendererProps) {
  const props = block.props as Record<string, unknown>;

  const type = block.type as string;

  // Normalize and render based on block type (supporting new conversion-focused blocks)
  switch (type) {
    case 'Hero':
      return <HeroBlock {...(props as any)} theme={theme} />;
    case 'Features':
      return <FeaturesBlock {...(props as any)} theme={theme} />;
    case 'Benefits':
      return <BenefitsBlock {...(props as any)} theme={theme} />;
    case 'SocialProof':
      return <SocialProofBlock {...(props as any)} theme={theme} />;
    case 'Pricing':
      return <PricingBlock {...(props as any)} theme={theme} />;
    case 'Countdown':
    case 'CountdownBlock': {
      const deadline = (props.deadline as string) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      return <UrgencyCountdownBlock deadline={deadline} label={props.label as string | undefined} />;
    }
    case 'FAQ':
      return <FAQBlock {...(props as any)} theme={theme} />;
    case 'ImageGallery':
      return <ImageGalleryBlock {...(props as any)} theme={theme} />;
    case 'Guarantee':
      return <GuaranteeBlock {...(props as any)} theme={theme} />;
    case 'CTASection':
      return <CTASectionBlock {...(props as any)} theme={theme} />;
    case 'Footer':
      return <FooterBlock {...(props as any)} theme={theme} />;
    case 'Form':
      return <FormBlock {...(props as any)} theme={theme} pageId={pageId} pageSlug={pageSlug} onSubmit={onLeadSubmit} />;
    case 'Popup':
      return <PopupBlock {...(props as any)} theme={theme} />;
    case 'StickyBar': {
      // Prefer provided text, otherwise cycle fake notifications
      return <FakeStickyBar text={props.text as string | undefined} cta={props.cta as string | undefined} />;
    }
    case 'PriceDeception': {
      const originalPrice = Number(props.originalPrice) || 997;
      const currentPrice = Number(props.currentPrice) || 97;
      const bonuses = (props.bonuses as string[]) || [];
      return <PriceDeceptionBlock originalPrice={originalPrice} currentPrice={currentPrice} bonuses={bonuses} />;
    }
    default:
      return null;
  }
}
