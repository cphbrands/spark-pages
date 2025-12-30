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
    {
      id: uuidv4(),
      templateName: 'Course / Ebook',
      templateDescription: 'Sell your digital product or online course',
      templateCategory: 'education',
      status: 'published',
      meta: { title: 'Learn From The Best', slug: 'course-ebook', description: 'Master new skills with our comprehensive course' },
      theme: { mode: 'light', primaryColor: '#EC4899', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Master [Skill] in 30 Days', subheadline: 'The complete video course with 50+ lessons, templates, and lifetime access', ctaText: 'Enroll Now', ctaUrl: '#pricing', alignment: 'center' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'What\'s Inside', items: [{ title: '50+ HD Video Lessons', description: 'Step-by-step tutorials you can follow at your own pace' }, { title: 'Downloadable Resources', description: 'Templates, checklists, and worksheets included' }, { title: 'Private Community', description: 'Connect with fellow students and get support' }, { title: 'Certificate of Completion', description: 'Showcase your achievement to employers' }] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Student Success Stories', testimonials: [{ quote: 'This course helped me land my dream job. The practical exercises were incredibly valuable.', author: 'Emily Chen', role: 'Course Graduate' }, { quote: 'Worth every penny. I\'ve taken many courses but this one actually delivers results.', author: 'James Miller', role: 'Entrepreneur' }] } },
        { id: uuidv4(), type: 'Pricing', props: { heading: 'Limited Time Offer', price: '$197', compareAtPrice: '$397', discountBadge: 'SAVE 50%', features: ['Lifetime access to all content', '50+ video lessons', 'Downloadable resources', 'Private community access', 'Certificate of completion', '30-day money back guarantee'], ctaText: 'Enroll Now', ctaUrl: '#' } },
        { id: uuidv4(), type: 'FAQ', props: { heading: 'Frequently Asked Questions', items: [{ question: 'How long do I have access?', answer: 'Lifetime access! Once you enroll, you can access the course forever.' }, { question: 'Is there a refund policy?', answer: 'Yes, we offer a 30-day money-back guarantee. No questions asked.' }, { question: 'Do I need any prior experience?', answer: 'No! This course is designed for complete beginners.' }] } },
        { id: uuidv4(), type: 'Guarantee', props: { heading: '30-Day Money Back Guarantee', text: 'If the course doesn\'t meet your expectations, get a full refund within 30 days.', icon: 'shield' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Course Academy', copyright: '© 2024 Course Academy. All rights reserved.' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      templateName: 'Local Business',
      templateDescription: 'Attract local customers to your business',
      templateCategory: 'local',
      status: 'published',
      meta: { title: 'Your Local Expert', slug: 'local-business', description: 'Quality services in your neighborhood' },
      theme: { mode: 'light', primaryColor: '#059669', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Your Trusted Local [Service]', subheadline: 'Serving [City] for over 10 years with quality and care. Free quotes available!', ctaText: 'Get Free Quote', ctaUrl: '#form', alignment: 'center' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'Why Choose Us', items: [{ title: 'Licensed & Insured', description: 'Fully certified professionals you can trust' }, { title: 'Same-Day Service', description: 'Quick response when you need us most' }, { title: 'Fair Pricing', description: 'Transparent quotes with no hidden fees' }, { title: 'Local & Reliable', description: 'Your neighbors, serving the community' }] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'What Our Customers Say', testimonials: [{ quote: 'Incredible service! They arrived on time and did an amazing job. Highly recommend to anyone in the area.', author: 'Lisa M.', role: 'Verified Customer' }, { quote: 'Professional, friendly, and affordable. Finally found a service I can rely on!', author: 'David K.', role: 'Repeat Customer' }] } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'Our Services Include', items: ['Service item one', 'Service item two', 'Service item three', 'Service item four', 'Emergency services available'] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Request a Free Quote', subheading: 'Tell us about your project and we\'ll get back to you within 24 hours', submitText: 'Get My Quote', showPhone: true, successMessage: 'Thanks! We\'ll call you shortly.' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Local Business Name', copyright: '© 2024 Serving [City] with pride' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      templateName: 'App Download',
      templateDescription: 'Promote your mobile app and drive downloads',
      templateCategory: 'app',
      status: 'published',
      meta: { title: 'Download Our App', slug: 'app-download', description: 'The app that makes your life easier' },
      theme: { mode: 'dark', primaryColor: '#6366F1', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Your Life, Simplified', subheadline: 'Download the #1 rated app that helps you [benefit]. Available on iOS and Android.', ctaText: 'Download Free', ctaUrl: '#', alignment: 'center' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'Powerful Features', items: [{ title: 'Lightning Fast', description: 'Optimized for speed on any device' }, { title: 'Offline Mode', description: 'Works even without internet connection' }, { title: 'Sync Everywhere', description: 'Access your data on all devices' }, { title: 'Privacy First', description: 'Your data stays yours, always' }] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Loved by Millions', testimonials: [{ quote: 'This app has become essential to my daily routine. Can\'t imagine life without it!', author: 'Alex Rivera', role: '5-star review' }] } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'Why Users Love Us', items: ['4.9 star rating on App Store', 'Over 1 million downloads', 'Featured by Apple & Google', 'Free to download'] } },
        { id: uuidv4(), type: 'CTASection', props: { heading: 'Ready to Get Started?', subheading: 'Download now and join millions of happy users', ctaText: 'Get the App', ctaUrl: '#', variant: 'gradient' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'App Name', copyright: '© 2024 App Name Inc.' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    // NEW TEMPLATES - Coaching
    {
      id: uuidv4(),
      templateName: 'Coaching Program',
      templateDescription: 'Sell coaching services or mentorship programs',
      templateCategory: 'coaching',
      status: 'published',
      meta: { title: '1-on-1 Coaching', slug: 'coaching-program', description: 'Transform your life with personal coaching' },
      theme: { mode: 'light', primaryColor: '#7C3AED', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Unlock Your Full Potential', subheadline: 'Personal coaching that transforms your career, relationships, and life.', ctaText: 'Book Free Call', ctaUrl: '#form', alignment: 'center' } },
        { id: uuidv4(), type: 'StickyBar', props: { text: '⚡ Limited spots available - Only 5 clients per month', ctaText: 'Apply Now', ctaUrl: '#form', position: 'top', dismissible: true } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'What You\'ll Achieve', items: ['Crystal clear clarity on your goals', 'Breakthrough limiting beliefs', 'Actionable strategies that work', 'Accountability and support', 'Results in 90 days or less'] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Client Transformations', testimonials: [{ quote: 'Working with this coach changed everything. I got promoted within 3 months and finally have work-life balance.', author: 'Michelle K.', role: 'Marketing Director' }, { quote: 'The best investment I\'ve ever made in myself. Truly life-changing.', author: 'David R.', role: 'Entrepreneur' }] } },
        { id: uuidv4(), type: 'Pricing', props: { heading: 'Investment', price: '$2,997', compareAtPrice: '$5,000', discountBadge: 'FOUNDING RATE', features: ['12 weekly 1-on-1 sessions', 'Unlimited text/email support', 'Custom action plans', 'Resource library access', 'Lifetime community access'], ctaText: 'Apply Now', ctaUrl: '#form' } },
        { id: uuidv4(), type: 'FAQ', props: { heading: 'Common Questions', items: [{ question: 'How do I know if coaching is right for me?', answer: 'Book a free discovery call and we\'ll discuss your goals to see if it\'s a good fit.' }, { question: 'What\'s your refund policy?', answer: 'If you don\'t see results after following the program, we offer a full refund.' }] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Apply for Coaching', subheading: 'Fill out this form and I\'ll personally review your application', submitText: 'Submit Application', showPhone: true, successMessage: 'Application received! I\'ll be in touch within 24 hours.' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Coach Name', copyright: '© 2024 All rights reserved' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    // Flash Sale template
    {
      id: uuidv4(),
      templateName: 'Flash Sale',
      templateDescription: 'High-urgency limited-time sale page',
      templateCategory: 'ecommerce',
      status: 'published',
      meta: { title: 'Flash Sale', slug: 'flash-sale', description: 'Massive discounts for a limited time' },
      theme: { mode: 'dark', primaryColor: '#EF4444', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'StickyBar', props: { text: '🔥 FLASH SALE - Ends at midnight!', ctaText: 'Shop Now', ctaUrl: '#pricing', position: 'top', dismissible: false, countdown: true, countdownEndAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() } },
        { id: uuidv4(), type: 'Hero', props: { headline: '70% OFF Everything', subheadline: 'Our biggest sale of the year. Once it\'s gone, it\'s gone.', ctaText: 'Shop the Sale', ctaUrl: '#pricing', alignment: 'center' } },
        { id: uuidv4(), type: 'Countdown', props: { endAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), label: 'Sale Ends In', scarcityText: 'Only 47 items left in stock!' } },
        { id: uuidv4(), type: 'Pricing', props: { heading: 'Exclusive Flash Deal', price: '$29', compareAtPrice: '$97', discountBadge: '70% OFF', features: ['Premium product included', 'Free express shipping', 'Bonus accessory pack', '1-year warranty'], ctaText: 'Buy Now - Save $68', ctaUrl: '#' } },
        { id: uuidv4(), type: 'Guarantee', props: { heading: 'Risk-Free Purchase', text: '30-day money back guarantee. No questions asked.', icon: 'shield' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Flash Deals', copyright: '© 2024 Flash Deals' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    // Consultation Booking
    {
      id: uuidv4(),
      templateName: 'Free Consultation',
      templateDescription: 'Book free consultations for services',
      templateCategory: 'services',
      status: 'published',
      meta: { title: 'Free Consultation', slug: 'free-consultation', description: 'Book your free consultation today' },
      theme: { mode: 'light', primaryColor: '#0D9488', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Get Expert Advice - Free', subheadline: 'Book a 30-minute consultation with our specialists. No obligation, no pressure.', ctaText: 'Book Free Call', ctaUrl: '#form', alignment: 'center' } },
        { id: uuidv4(), type: 'Features', props: { heading: 'What We\'ll Cover', items: [{ title: 'Your Current Situation', description: 'We\'ll analyze where you are now' }, { title: 'Your Goals', description: 'Define exactly what success looks like' }, { title: 'Action Plan', description: 'Get a clear roadmap to achieve your goals' }] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Trusted by 500+ Clients', testimonials: [{ quote: 'The free consultation alone was worth its weight in gold. They gave me actionable advice immediately.', author: 'Tom H.', role: 'Business Owner' }] } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'Why Book With Us', items: ['100% free, no strings attached', 'Expert consultants with 10+ years experience', 'Personalized recommendations', 'No sales pressure'] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Book Your Free Call', subheading: 'Select your preferred time and we\'ll confirm within 1 hour', submitText: 'Request Consultation', showPhone: true, successMessage: 'Booked! Check your email for confirmation.' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Expert Services', copyright: '© 2024 Expert Services' } },
      ],
      createdAt: now,
      updatedAt: now,
    },
    // Newsletter Signup
    {
      id: uuidv4(),
      templateName: 'Newsletter Signup',
      templateDescription: 'Grow your email list with a focused signup page',
      templateCategory: 'marketing',
      status: 'published',
      meta: { title: 'Join Our Newsletter', slug: 'newsletter', description: 'Get weekly tips and insights' },
      theme: { mode: 'dark', primaryColor: '#F97316', font: 'outfit', buttonStyle: 'solid' },
      blocks: [
        { id: uuidv4(), type: 'Hero', props: { headline: 'Weekly Insights Delivered Free', subheadline: 'Join 15,000+ subscribers getting actionable tips every Tuesday.', ctaText: 'Subscribe Free', ctaUrl: '#form', alignment: 'center' } },
        { id: uuidv4(), type: 'Benefits', props: { heading: 'What You\'ll Get', items: ['Curated industry insights', 'Exclusive tips not shared anywhere else', 'Early access to new products', 'Free resources and templates'] } },
        { id: uuidv4(), type: 'SocialProof', props: { heading: 'Reader Favorites', testimonials: [{ quote: 'The only newsletter I actually open every week. Always valuable, never spammy.', author: 'Sarah L.', role: 'Subscriber since 2022' }] } },
        { id: uuidv4(), type: 'Form', props: { heading: 'Subscribe Now', subheading: 'Free forever. Unsubscribe anytime.', submitText: 'Join the List', showPhone: false, successMessage: 'Welcome aboard! Check your inbox for a confirmation.' } },
        { id: uuidv4(), type: 'Footer', props: { companyName: 'Newsletter', copyright: '© 2024' } },
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

  // History
  undoStack: Page[][];
  redoStack: Page[][];
  
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

  // History actions
  undo: () => void;
  redo: () => void;
  
  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  getLeadsByPage: (pageId: string) => Lead[];
  
  // Meta/Theme actions
  updatePageMeta: (pageId: string, meta: Partial<Meta>) => void;
  updatePageTheme: (pageId: string, theme: Partial<Theme>) => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => {
      const captureHistory = () => {
        const { pages, undoStack } = get();
        const snapshot = JSON.parse(JSON.stringify(pages)) as Page[];
        set({ undoStack: [...undoStack, snapshot].slice(-20), redoStack: [] });
      };

      return {
        pages: [],
        templates: generateTemplates(),
        leads: [],
        undoStack: [],
        redoStack: [],
        currentPageId: null,
        selectedBlockId: null,
        previewMode: 'desktop',

      undo: () => {
        const { undoStack, redoStack, pages } = get();
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        set({
          pages: prev,
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, pages].slice(-20),
        });
      },

      redo: () => {
        const { undoStack, redoStack, pages } = get();
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        set({
          pages: next,
          redoStack: redoStack.slice(0, -1),
          undoStack: [...undoStack, pages].slice(-20),
        });
      },
      
      setCurrentPage: (id) => set({ currentPageId: id, selectedBlockId: null }),
      setSelectedBlock: (id) => set({ selectedBlockId: id }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      
      createPageFromTemplate: (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) throw new Error('Template not found');
        
        captureHistory();

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
        captureHistory();
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
        captureHistory();
        set(state => ({
          pages: state.pages.map(page =>
            page.id === id
              ? { ...page, ...updates, updatedAt: new Date().toISOString() }
              : page
          ),
        }));
      },
      
      deletePage: (id) => {
        captureHistory();
        set(state => ({
          pages: state.pages.filter(page => page.id !== id),
          currentPageId: state.currentPageId === id ? null : state.currentPageId,
        }));
      },
      
      duplicatePage: (id) => {
        const page = get().pages.find(p => p.id === id);
        if (!page) throw new Error('Page not found');
        captureHistory();
        
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
        captureHistory();
        
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
        captureHistory();
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
        captureHistory();
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
        captureHistory();
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
        captureHistory();
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
        captureHistory();
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
        captureHistory();
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
    };
    },
    {
      name: 'landing-page-builder',
    }
  )
);
