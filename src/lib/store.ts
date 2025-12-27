import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Page, Template, Lead, Block, Theme, Meta, defaultBlockProps, BlockType } from './schemas';
import { v4 as uuidv4 } from 'uuid';

// Generate default templates
const generateTemplates = (): Template[] => {
  const now = new Date().toISOString();
  
  return [
    {
      id: uuidv4(),
      templateName: 'Product Discount',
      templateDescription: 'Perfect for product launches with countdown timers',
      templateCategory: 'ecommerce',
      status: 'published',
      meta: { title: 'Limited Time Offer', slug: 'product-discount', description: 'Get our product at an amazing discount' },
      theme: { mode: 'light', primaryColor: '#3B82F6', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Get 50% Off Today Only!', subheadline: 'Our best-selling product at half the price', ctaText: 'Claim Discount', ctaUrl: '#pricing', alignment: 'center' } },
        { id: uuidv4(), type: 'Countdown', props: { endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), label: 'Sale Ends In', scarcityText: 'Only 23 items left at this price!' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'What You Get', items: [{ title: 'Premium Quality', description: 'Crafted with the finest materials' }, { title: 'Free Shipping', description: 'Delivered to your door at no extra cost' }, { title: 'Lifetime Warranty', description: 'We stand behind our products forever' }] } },
        { id: uuidv4(), type: 'Pricing', props: { heading: 'Special Launch Price', price: '$49', compareAtPrice: '$99', discountBadge: '50% OFF', features: ['Premium quality product', 'Free express shipping', 'Lifetime warranty', '30-day money back guarantee'], ctaText: 'Buy Now', ctaUrl: '#' } },
        { id: uuidv4(), type: 'Guarantee', props: { heading: 'Risk-Free Purchase', text: "Try it for 30 days. If you don't love it, we'll refund every penny.", icon: 'shield' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Your Store', copyright: '© 2024 Your Store. All rights reserved.' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      templateName: 'Lead Generation',
      templateDescription: 'Capture leads with a clean, focused form',
      templateCategory: 'marketing',
      status: 'published',
      meta: { title: 'Get Your Free Guide', slug: 'lead-gen', description: 'Download our free guide today' },
      theme: { mode: 'light', primaryColor: '#10B981', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'The Ultimate Guide to Success', subheadline: 'Download our free 50-page guide and transform your business', ctaText: 'Get Free Guide', ctaUrl: '#form', alignment: 'center' } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'What You\'ll Learn', items: ['Proven strategies that work in 2024', 'Step-by-step implementation guide', 'Real case studies and examples', 'Bonus templates and checklists'] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Join 10,000+ Subscribers', testimonials: [{ quote: 'This guide completely changed how I approach my business. Highly recommended!', author: 'Sarah Johnson', role: 'Founder, StartupXYZ' }] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Get Instant Access', subheading: 'Enter your details below to download the guide', submitText: 'Download Free Guide', showPhone: false, successMessage: 'Check your email for the download link!' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Your Brand', copyright: '© 2024 Your Brand. All rights reserved.' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      templateName: 'Webinar Registration',
      templateDescription: 'Drive registrations for your upcoming event',
      templateCategory: 'events',
      status: 'published',
      meta: { title: 'Free Webinar', slug: 'webinar', description: 'Register for our exclusive webinar' },
      theme: { mode: 'dark', primaryColor: '#8B5CF6', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Master Digital Marketing in 2024', subheadline: 'Join our free 60-minute masterclass with industry experts', ctaText: 'Reserve Your Spot', ctaUrl: '#register', alignment: 'center' } },
        { id: uuidv4(), type: 'Countdown', props: { endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), label: 'Webinar Starts In', scarcityText: 'Limited to 500 attendees' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'What You\'ll Discover', items: [{ title: 'Latest Trends', description: 'Stay ahead with cutting-edge strategies' }, { title: 'Live Q&A', description: 'Get your questions answered in real-time' }, { title: 'Free Resources', description: 'Exclusive templates and tools for attendees' }] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Register Now', subheading: 'Secure your seat for this exclusive event', submitText: 'Register Free', showPhone: true, successMessage: 'You\'re registered! Check your email for details.' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Marketing Academy', copyright: '© 2024 Marketing Academy' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      templateName: 'SaaS Product',
      templateDescription: 'Showcase your software product',
      templateCategory: 'saas',
      status: 'published',
      meta: { title: 'Transform Your Workflow', slug: 'saas-product', description: 'The tool that makes your team 10x more productive' },
      theme: { mode: 'light', primaryColor: '#0EA5E9', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'The All-in-One Platform for Modern Teams', subheadline: 'Streamline your workflow, boost productivity, and scale your business', ctaText: 'Start Free Trial', ctaUrl: '#pricing', alignment: 'center' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'Powerful Features', items: [{ title: 'Real-time Collaboration', description: 'Work together seamlessly with your team' }, { title: 'Smart Automation', description: 'Automate repetitive tasks and save hours' }, { title: 'Advanced Analytics', description: 'Make data-driven decisions with insights' }, { title: 'Secure & Reliable', description: 'Enterprise-grade security you can trust' }] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Trusted by Industry Leaders', testimonials: [{ quote: 'This platform reduced our project delivery time by 40%. Absolutely essential for any growing team.', author: 'Mike Chen', role: 'CTO, TechCorp' }] } },
        { id: uuidv4(), type: 'Pricing', props: { heading: 'Simple, Transparent Pricing', price: '$29/month', compareAtPrice: '$49/month', discountBadge: 'Early Bird', features: ['Unlimited users', 'All features included', 'Priority support', 'Custom integrations'], ctaText: 'Start Free Trial', ctaUrl: '#' } },
        { id: uuidv4(), type: 'FAQ', props: { heading: 'Questions? We\'ve Got Answers', items: [{ question: 'Is there a free trial?', answer: 'Yes! Start with a 14-day free trial. No credit card required.' }, { question: 'Can I cancel anytime?', answer: 'Absolutely. Cancel anytime with no questions asked.' }] } },
        { id: uuidv4(), type: 'CTASection', props: { heading: 'Ready to Transform Your Team?', subheading: 'Join 5,000+ companies already using our platform', ctaText: 'Get Started Free', ctaUrl: '#', variant: 'gradient' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'SaaSApp', copyright: '© 2024 SaaSApp Inc.' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      templateName: 'Waitlist',
      templateDescription: 'Simple waitlist page for upcoming launches',
      templateCategory: 'launch',
      status: 'published',
      meta: { title: 'Coming Soon', slug: 'waitlist', description: 'Be the first to know when we launch' },
      theme: { mode: 'dark', primaryColor: '#F59E0B', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Something Amazing is Coming', subheadline: 'Be the first to get access when we launch. Join the waitlist today.', ctaText: 'Join Waitlist', ctaUrl: '#waitlist', alignment: 'center' } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'Early Access Perks', items: ['Be first to try new features', 'Exclusive founding member pricing', 'Direct access to the founding team', 'Shape the product roadmap'] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Join the Waitlist', subheading: 'Get notified as soon as we launch', submitText: 'Notify Me', showPhone: false, successMessage: 'You\'re on the list! We\'ll be in touch soon.' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Startup Name', copyright: '© 2024 Coming Soon' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
};

interface BuilderState {
  // Pages
  pages: Page[];
  templates: Template[];
  leads: Lead[];
  
  // Current editor state
  currentPageId: string | null;
  selectedBlockId: string | null;
  previewMode: 'desktop' | 'mobile';
  
  // Actions
  setCurrentPage: (id: string | null) => void;
  setSelectedBlock: (id: string | null) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  
  // Page actions
  createPageFromTemplate: (templateId: string) => Page;
  createBlankPage: () => Page;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => Page;
  publishPage: (id: string) => void;
  unpublishPage: (id: string) => void;
  getPageBySlug: (slug: string) => Page | undefined;
  
  // Block actions
  addBlock: (pageId: string, type: BlockType, afterBlockId?: string) => void;
  updateBlock: (pageId: string, blockId: string, props: Record<string, unknown>) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  duplicateBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, direction: 'up' | 'down') => void;
  
  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  getLeadsByPage: (pageId: string) => Lead[];
  
  // Meta/Theme actions
  updatePageMeta: (pageId: string, meta: Partial<Meta>) => void;
  updatePageTheme: (pageId: string, theme: Partial<Theme>) => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      pages: [],
      templates: generateTemplates(),
      leads: [],
      currentPageId: null,
      selectedBlockId: null,
      previewMode: 'desktop',
      
      setCurrentPage: (id) => set({ currentPageId: id, selectedBlockId: null }),
      setSelectedBlock: (id) => set({ selectedBlockId: id }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      
      createPageFromTemplate: (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) throw new Error('Template not found');
        
        const now = new Date().toISOString();
        const newPage: Page = {
          id: uuidv4(),
          status: 'draft',
          meta: {
            ...template.meta,
            slug: `${template.meta.slug}-${Date.now()}`,
          },
          theme: { ...template.theme },
          blocks: template.blocks.map(block => ({
            ...block,
            id: uuidv4(),
            props: { ...block.props },
          })),
          createdAt: now,
          updatedAt: now,
        };
        
        set(state => ({ pages: [...state.pages, newPage] }));
        return newPage;
      },
      
      createBlankPage: () => {
        const now = new Date().toISOString();
        const newPage: Page = {
          id: uuidv4(),
          status: 'draft',
          meta: {
            title: 'Untitled Page',
            slug: `page-${Date.now()}`,
            description: '',
          },
          theme: {
            mode: 'light',
            primaryColor: '#3B82F6',
            font: 'outfit',
            buttonStyle: 'solid',
          },
          blocks: [],
          createdAt: now,
          updatedAt: now,
        };
        
        set(state => ({ pages: [...state.pages, newPage] }));
        return newPage;
      },
      
      updatePage: (id, updates) => {
        set(state => ({
          pages: state.pages.map(page =>
            page.id === id
              ? { ...page, ...updates, updatedAt: new Date().toISOString() }
              : page
          ),
        }));
      },
      
      deletePage: (id) => {
        set(state => ({
          pages: state.pages.filter(page => page.id !== id),
          currentPageId: state.currentPageId === id ? null : state.currentPageId,
        }));
      },
      
      duplicatePage: (id) => {
        const page = get().pages.find(p => p.id === id);
        if (!page) throw new Error('Page not found');
        
        const now = new Date().toISOString();
        const newPage: Page = {
          ...page,
          id: uuidv4(),
          status: 'draft',
          meta: {
            ...page.meta,
            title: `${page.meta.title} (Copy)`,
            slug: `${page.meta.slug}-copy-${Date.now()}`,
          },
          blocks: page.blocks.map(block => ({
            ...block,
            id: uuidv4(),
          })),
          createdAt: now,
          updatedAt: now,
        };
        
        set(state => ({ pages: [...state.pages, newPage] }));
        return newPage;
      },
      
      publishPage: (id) => {
        const page = get().pages.find(p => p.id === id);
        if (!page) return;
        
        // Check for slug conflicts
        const conflictingPage = get().pages.find(
          p => p.id !== id && p.status === 'published' && p.meta.slug === page.meta.slug
        );
        
        if (conflictingPage) {
          throw new Error(`Another published page already uses the slug "${page.meta.slug}"`);
        }
        
        set(state => ({
          pages: state.pages.map(p =>
            p.id === id
              ? { ...p, status: 'published', updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
      
      unpublishPage: (id) => {
        set(state => ({
          pages: state.pages.map(page =>
            page.id === id
              ? { ...page, status: 'draft', updatedAt: new Date().toISOString() }
              : page
          ),
        }));
      },
      
      getPageBySlug: (slug) => {
        return get().pages.find(p => p.status === 'published' && p.meta.slug === slug);
      },
      
      addBlock: (pageId, type, afterBlockId) => {
        const newBlock: Block = {
          id: uuidv4(),
          type,
          props: defaultBlockProps[type] as Record<string, unknown>,
        };
        
        set(state => ({
          pages: state.pages.map(page => {
            if (page.id !== pageId) return page;
            
            let newBlocks: Block[];
            if (afterBlockId) {
              const index = page.blocks.findIndex(b => b.id === afterBlockId);
              newBlocks = [
                ...page.blocks.slice(0, index + 1),
                newBlock,
                ...page.blocks.slice(index + 1),
              ];
            } else {
              newBlocks = [...page.blocks, newBlock];
            }
            
            return {
              ...page,
              blocks: newBlocks,
              updatedAt: new Date().toISOString(),
            };
          }),
          selectedBlockId: newBlock.id,
        }));
      },
      
      updateBlock: (pageId, blockId, props) => {
        set(state => ({
          pages: state.pages.map(page => {
            if (page.id !== pageId) return page;
            return {
              ...page,
              blocks: page.blocks.map(block =>
                block.id === blockId
                  ? { ...block, props: { ...block.props, ...props } }
                  : block
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      
      deleteBlock: (pageId, blockId) => {
        set(state => ({
          pages: state.pages.map(page => {
            if (page.id !== pageId) return page;
            return {
              ...page,
              blocks: page.blocks.filter(block => block.id !== blockId),
              updatedAt: new Date().toISOString(),
            };
          }),
          selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
        }));
      },
      
      duplicateBlock: (pageId, blockId) => {
        set(state => ({
          pages: state.pages.map(page => {
            if (page.id !== pageId) return page;
            
            const blockIndex = page.blocks.findIndex(b => b.id === blockId);
            if (blockIndex === -1) return page;
            
            const originalBlock = page.blocks[blockIndex];
            const newBlock: Block = {
              ...originalBlock,
              id: uuidv4(),
              props: { ...originalBlock.props },
            };
            
            const newBlocks = [
              ...page.blocks.slice(0, blockIndex + 1),
              newBlock,
              ...page.blocks.slice(blockIndex + 1),
            ];
            
            return {
              ...page,
              blocks: newBlocks,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      
      moveBlock: (pageId, blockId, direction) => {
        set(state => ({
          pages: state.pages.map(page => {
            if (page.id !== pageId) return page;
            
            const blockIndex = page.blocks.findIndex(b => b.id === blockId);
            if (blockIndex === -1) return page;
            
            const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
            if (newIndex < 0 || newIndex >= page.blocks.length) return page;
            
            const newBlocks = [...page.blocks];
            [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];
            
            return {
              ...page,
              blocks: newBlocks,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      
      addLead: (leadData) => {
        const lead: Lead = {
          ...leadData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({ leads: [...state.leads, lead] }));
      },
      
      getLeadsByPage: (pageId) => {
        return get().leads.filter(lead => lead.pageId === pageId);
      },
      
      updatePageMeta: (pageId, meta) => {
        set(state => ({
          pages: state.pages.map(page =>
            page.id === pageId
              ? {
                  ...page,
                  meta: { ...page.meta, ...meta },
                  updatedAt: new Date().toISOString(),
                }
              : page
          ),
        }));
      },
      
      updatePageTheme: (pageId, theme) => {
        set(state => ({
          pages: state.pages.map(page =>
            page.id === pageId
              ? {
                  ...page,
                  theme: { ...page.theme, ...theme },
                  updatedAt: new Date().toISOString(),
                }
              : page
          ),
        }));
      },
    }),
    {
      name: 'landing-page-builder',
    }
  )
);
