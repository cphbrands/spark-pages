import { Theme } from '@/lib/schemas';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sun, Moon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSettingsProps {
  theme: Theme;
  onChange: (updates: Partial<Theme>) => void;
}

const presetColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
];

const fontOptions = [
  { value: 'inter', label: 'Inter', preview: 'font-sans' },
  { value: 'outfit', label: 'Outfit', preview: 'font-display' },
  { value: 'system', label: 'System', preview: '' },
];

const buttonStyles = [
  { value: 'solid', label: 'Solid', description: 'Filled background' },
  { value: 'outline', label: 'Outline', description: 'Border only' },
];

export function ThemeSettings({ theme, onChange }: ThemeSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div>
        <Label className="text-builder-text-muted mb-3 block">Color Mode</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onChange({ mode: 'light' })}
            className={cn(
              "flex-1 border-builder-border",
              theme.mode === 'light' 
                ? "bg-builder-surface-hover border-primary text-builder-text" 
                : "text-builder-text-muted hover:bg-builder-surface-hover"
            )}
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
            {theme.mode === 'light' && <Check className="w-4 h-4 ml-2" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => onChange({ mode: 'dark' })}
            className={cn(
              "flex-1 border-builder-border",
              theme.mode === 'dark' 
                ? "bg-builder-surface-hover border-primary text-builder-text" 
                : "text-builder-text-muted hover:bg-builder-surface-hover"
            )}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
            {theme.mode === 'dark' && <Check className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <Label className="text-builder-text-muted mb-3 block">Primary Color</Label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {presetColors.map(color => (
            <button
              key={color.value}
              onClick={() => onChange({ primaryColor: color.value })}
              className={cn(
                "w-full aspect-square rounded-lg transition-all duration-200 relative",
                theme.primaryColor === color.value 
                  ? "ring-2 ring-offset-2 ring-offset-builder-surface ring-white scale-110" 
                  : "hover:scale-105"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {theme.primaryColor === color.value && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div 
            className="w-10 h-10 rounded-lg border border-builder-border shrink-0"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <Input
            type="text"
            value={theme.primaryColor}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                onChange({ primaryColor: value || '#' });
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                onChange({ primaryColor: '#3B82F6' });
              }
            }}
            placeholder="#3B82F6"
            className="bg-builder-bg border-builder-border text-builder-text font-mono"
          />
        </div>
      </div>

      {/* Font */}
      <div>
        <Label className="text-builder-text-muted mb-3 block">Font Family</Label>
        <Select value={theme.font} onValueChange={(v) => onChange({ font: v as Theme['font'] })}>
          <SelectTrigger className="bg-builder-bg border-builder-border text-builder-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-builder-surface border-builder-border">
            {fontOptions.map(font => (
              <SelectItem 
                key={font.value} 
                value={font.value}
                className="text-builder-text"
              >
                <span className={font.preview}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-builder-text-muted mt-2">
          Preview: <span className={theme.font === 'outfit' ? 'font-display' : 'font-sans'}>
            The quick brown fox jumps over the lazy dog
          </span>
        </p>
      </div>

      {/* Button Style */}
      <div>
        <Label className="text-builder-text-muted mb-3 block">Button Style</Label>
        <div className="space-y-2">
          {buttonStyles.map(style => (
            <button
              key={style.value}
              onClick={() => onChange({ buttonStyle: style.value as Theme['buttonStyle'] })}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-all duration-200 flex items-center justify-between",
                theme.buttonStyle === style.value 
                  ? "border-primary bg-primary/10" 
                  : "border-builder-border hover:border-builder-accent"
              )}
            >
              <div>
                <span className="font-medium text-builder-text">{style.label}</span>
                <p className="text-xs text-builder-text-muted">{style.description}</p>
              </div>
              <div 
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  style.value === 'solid' 
                    ? "text-white" 
                    : "bg-transparent border-2"
                )}
                style={{ 
                  backgroundColor: style.value === 'solid' ? theme.primaryColor : 'transparent',
                  borderColor: style.value === 'outline' ? theme.primaryColor : 'transparent',
                  color: style.value === 'outline' ? theme.primaryColor : 'white',
                }}
              >
                Button
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <Label className="text-builder-text-muted mb-3 block">Preview</Label>
        <div 
          className={cn(
            "rounded-xl p-6 border transition-colors duration-300",
            theme.mode === 'dark' 
              ? "bg-slate-900 border-slate-700" 
              : "bg-white border-slate-200"
          )}
        >
          <h3 
            className={cn(
              "text-lg font-bold mb-2",
              theme.font === 'outfit' ? 'font-display' : 'font-sans',
              theme.mode === 'dark' ? 'text-white' : 'text-slate-900'
            )}
          >
            Sample Heading
          </h3>
          <p 
            className={cn(
              "text-sm mb-4",
              theme.mode === 'dark' ? 'text-slate-400' : 'text-slate-600'
            )}
          >
            This is how your landing page will look with the current theme settings.
          </p>
          <button
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              theme.buttonStyle === 'solid'
                ? "text-white"
                : "bg-transparent border-2"
            )}
            style={{
              backgroundColor: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
              borderColor: theme.buttonStyle === 'outline' ? theme.primaryColor : 'transparent',
              color: theme.buttonStyle === 'outline' ? theme.primaryColor : 'white',
            }}
          >
            Call to Action
          </button>
        </div>
      </div>
    </div>
  );
}
