import { useState } from 'react';
import { Sparkles, Send, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RefinePromptProps {
  onRefine: (prompt: string) => Promise<void>;
  isRefining: boolean;
}

export function RefinePrompt({ onRefine, isRefining }: RefinePromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || isRefining) return;
    await onRefine(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-builder-surface/95 backdrop-blur-xl border border-builder-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Toggle header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-builder-surface-hover transition-colors"
        >
          <div className="flex items-center gap-2 text-builder-text">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Refine with AI</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-builder-text-muted" />
          ) : (
            <ChevronUp className="w-4 h-4 text-builder-text-muted" />
          )}
        </button>

        {/* Expandable content */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-4 pt-0 space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g., 'Make the headline more exciting', 'Add a FAQ section', 'Change to dark mode'..."
              className="min-h-[80px] bg-builder-bg border-builder-border text-builder-text placeholder:text-builder-text-muted resize-none"
              disabled={isRefining}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-builder-text-muted">
                Press Enter to send, Shift+Enter for new line
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isRefining}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Refine
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
