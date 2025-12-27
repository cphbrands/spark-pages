// Analytics utility for GA4/GTM integration

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type AnalyticsEvent = 
  | 'cta_click'
  | 'form_submit'
  | 'form_error'
  | 'page_view'
  | 'block_view'
  | 'countdown_expired';

export interface AnalyticsEventData {
  event_category?: string;
  event_label?: string;
  page_slug?: string;
  block_type?: string;
  button_text?: string;
  form_id?: string;
  [key: string]: unknown;
}

/**
 * Track an event via Google Analytics 4 / GTM
 */
export function trackEvent(eventName: AnalyticsEvent, data?: AnalyticsEventData): void {
  // GA4 via gtag
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // GTM dataLayer push
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Console log for debugging in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, data);
  }
}

/**
 * Track CTA button click
 */
export function trackCTAClick(buttonText: string, pageSlug: string, blockType?: string): void {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: buttonText,
    button_text: buttonText,
    page_slug: pageSlug,
    block_type: blockType,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(pageSlug: string, formId?: string): void {
  trackEvent('form_submit', {
    event_category: 'conversion',
    event_label: pageSlug,
    page_slug: pageSlug,
    form_id: formId,
  });
}

/**
 * Track form error
 */
export function trackFormError(pageSlug: string, errorMessage: string): void {
  trackEvent('form_error', {
    event_category: 'error',
    event_label: errorMessage,
    page_slug: pageSlug,
  });
}

/**
 * Track page view
 */
export function trackPageView(pageSlug: string, pageTitle: string): void {
  trackEvent('page_view', {
    event_category: 'navigation',
    event_label: pageTitle,
    page_slug: pageSlug,
  });
}

/**
 * Initialize GA4 with measurement ID
 */
export function initGA4(measurementId: string): void {
  if (typeof window === 'undefined' || !measurementId) return;

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

/**
 * Initialize GTM with container ID
 */
export function initGTM(containerId: string): void {
  if (typeof window === 'undefined' || !containerId) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  // Load GTM script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);
}
