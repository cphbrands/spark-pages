import { Block, Theme, BlockType } from '@/lib/schemas';
import {
  HeroBlock,
  FeaturesBlock,
  BenefitsBlock,
  SocialProofBlock,
  PricingBlock,
  CountdownBlock,
  FAQBlock,
  ImageGalleryBlock,
  GuaranteeBlock,
  CTASectionBlock,
  FooterBlock,
  FormBlock,
  PopupBlock,
  StickyBarBlock,
} from '@/components/blocks';

interface BlockRendererProps {
  block: Block;
  theme: Theme;
  pageId?: string;
  pageSlug?: string;
  onLeadSubmit?: (data: { name: string; email: string; phone?: string }) => Promise<void>;
}

export function BlockRenderer({ block, theme, pageId, pageSlug, onLeadSubmit }: BlockRendererProps) {
  const props = block.props as Record<string, unknown>;

  const blockComponents: Record<BlockType, React.ReactNode> = {
    Hero: <HeroBlock {...(props as any)} theme={theme} />,
    Features: <FeaturesBlock {...(props as any)} theme={theme} />,
    Benefits: <BenefitsBlock {...(props as any)} theme={theme} />,
    SocialProof: <SocialProofBlock {...(props as any)} theme={theme} />,
    Pricing: <PricingBlock {...(props as any)} theme={theme} />,
    Countdown: <CountdownBlock {...(props as any)} theme={theme} />,
    FAQ: <FAQBlock {...(props as any)} theme={theme} />,
    ImageGallery: <ImageGalleryBlock {...(props as any)} theme={theme} />,
    Guarantee: <GuaranteeBlock {...(props as any)} theme={theme} />,
    CTASection: <CTASectionBlock {...(props as any)} theme={theme} />,
    Footer: <FooterBlock {...(props as any)} theme={theme} />,
    Form: <FormBlock {...(props as any)} theme={theme} pageId={pageId} pageSlug={pageSlug} onSubmit={onLeadSubmit} />,
    Popup: <PopupBlock {...(props as any)} theme={theme} />,
    StickyBar: <StickyBarBlock {...(props as any)} theme={theme} />,
  };

  return <>{blockComponents[block.type]}</>;
}
