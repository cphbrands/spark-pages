import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '@/lib/store';
import { 
  ShoppingBag, 
  Mail, 
  Video, 
  Rocket, 
  Clock, 
  BookOpen, 
  Store, 
  Smartphone,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  ecommerce: ShoppingBag,
  marketing: Mail,
  events: Video,
  saas: Rocket,
  launch: Clock,
  education: BookOpen,
  local: Store,
  app: Smartphone,
};

const categoryLabels: Record<string, string> = {
  ecommerce: 'E-Commerce',
  marketing: 'Marketing',
  events: 'Events',
  saas: 'SaaS',
  launch: 'Launch',
  education: 'Education',
  local: 'Local Business',
  app: 'App',
};

export function TemplatePicker({ open, onOpenChange }: TemplatePickerProps) {
  const navigate = useNavigate();
  const { templates, createPageFromTemplate } = useBuilderStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const categories = [...new Set(templates.map(t => t.templateCategory || 'other'))];
  
  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.templateCategory === selectedCategory)
    : templates;

  const handleSelectTemplate = (templateId: string) => {
    const newPage = createPageFromTemplate(templateId);
    onOpenChange(false);
    navigate(`/builder/pages/${newPage.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] bg-builder-surface border-builder-border text-builder-text overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose a Template</DialogTitle>
          <p className="text-builder-text-muted">
            Select a template based on your offer type to get started quickly
          </p>
        </DialogHeader>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-4 pb-4 border-b border-builder-border">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={cn(
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'border-builder-border text-builder-text hover:bg-builder-surface-hover'
            )}
          >
            All Templates
          </Button>
          {categories.map(category => {
            const Icon = categoryIcons[category] || ShoppingBag;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'border-builder-border text-builder-text hover:bg-builder-surface-hover'
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {categoryLabels[category] || category}
              </Button>
            );
          })}
        </div>
        
        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-[50vh] overflow-y-auto pr-2">
          {filteredTemplates.map(template => {
            const CategoryIcon = categoryIcons[template.templateCategory || ''] || ShoppingBag;
            const isHovered = hoveredTemplate === template.id;
            
            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={cn(
                  "relative rounded-xl border bg-builder-bg cursor-pointer transition-all duration-300 group overflow-hidden",
                  isHovered 
                    ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "border-builder-border hover:border-builder-accent"
                )}
              >
                {/* Preview */}
                <div 
                  className="h-36 flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    backgroundColor: template.theme.mode === 'dark' ? '#1e293b' : '#f8fafc',
                  }}
                >
                  <div 
                    className="text-lg font-bold opacity-30 text-center px-4 transition-transform duration-300"
                    style={{ 
                      color: template.theme.primaryColor,
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {template.templateName}
                  </div>
                  
                  {/* Overlay on hover */}
                  <div 
                    className={cn(
                      "absolute inset-0 bg-primary/90 flex items-center justify-center transition-opacity duration-300",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="text-center text-white">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                        <Check className="w-6 h-6" />
                      </div>
                      <span className="font-medium">Use Template</span>
                    </div>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-builder-text truncate">
                        {template.templateName}
                      </h3>
                      <p className="text-sm text-builder-text-muted mt-1 line-clamp-2">
                        {template.templateDescription}
                      </p>
                    </div>
                    <div 
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${template.theme.primaryColor}20` }}
                    >
                      <CategoryIcon 
                        className="w-4 h-4" 
                        style={{ color: template.theme.primaryColor }} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span 
                      className="px-2 py-0.5 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${template.theme.primaryColor}20`,
                        color: template.theme.primaryColor,
                      }}
                    >
                      {categoryLabels[template.templateCategory || ''] || 'Template'}
                    </span>
                    <span className="text-xs text-builder-text-muted">
                      {template.blocks.length} blocks
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
