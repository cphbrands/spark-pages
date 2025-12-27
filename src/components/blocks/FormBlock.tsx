import { Theme } from '@/lib/schemas';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle } from 'lucide-react';

interface FormBlockProps {
  heading?: string;
  subheading?: string;
  submitText?: string;
  showPhone?: boolean;
  successMessage?: string;
  theme: Theme;
  pageId?: string;
  pageSlug?: string;
  onSubmit?: (data: { name: string; email: string; phone?: string }) => Promise<void>;
}

export function FormBlock({ 
  heading, 
  subheading, 
  submitText = 'Submit', 
  showPhone = false,
  successMessage = 'Thank you! We\'ll be in touch soon.',
  theme,
  onSubmit,
}: FormBlockProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', honeypot: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (formData.honeypot) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (onSubmit) {
        await onSubmit({
          name: formData.name,
          email: formData.email,
          phone: showPhone ? formData.phone : undefined,
        });
      }
      setIsSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.mode === 'dark' ? '#334155' : '#ffffff',
    borderColor: theme.mode === 'dark' ? '#475569' : '#e2e8f0',
    color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
  };

  if (isSuccess) {
    return (
      <section 
        className="px-4 py-20"
        style={{
          backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
          color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
        }}
      >
        <div className="max-w-md mx-auto text-center">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: `${theme.primaryColor}20` }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: theme.primaryColor }} />
          </div>
          <p className="text-xl font-medium">{successMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="form"
      className="px-4 py-20"
      style={{
        backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
        color: theme.mode === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      <div className="max-w-md mx-auto">
        {heading && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: theme.font === 'outfit' ? 'Outfit, sans-serif' : theme.font === 'inter' ? 'Inter, sans-serif' : 'system-ui' }}
          >
            {heading}
          </h2>
        )}
        
        {subheading && (
          <p className="text-center opacity-70 mb-8">{subheading}</p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field */}
          <input
            type="text"
            name="website"
            value={formData.honeypot}
            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                ...inputStyle,
                '--tw-ring-color': theme.primaryColor,
              } as React.CSSProperties}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                ...inputStyle,
                '--tw-ring-color': theme.primaryColor,
              } as React.CSSProperties}
              placeholder="your@email.com"
            />
          </div>
          
          {showPhone && (
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  ...inputStyle,
                  '--tw-ring-color': theme.primaryColor,
                } as React.CSSProperties}
                placeholder="Your phone number"
              />
            </div>
          )}
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
              !isSubmitting && "hover:scale-105",
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
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              submitText
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
