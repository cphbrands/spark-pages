import { useState } from 'react';

interface PsychologyBoosterProps {
  currentPrompt: string;
  onBoost: (boostedPrompt: string) => void;
}

export function PsychologyBooster({ currentPrompt, onBoost }: PsychologyBoosterProps) {
  const boosters = [
    {
      name: "⚡ Add Pain Points",
      icon: "🔥",
      action: (prompt: string) => 
        prompt + "\n\nADD THESE PAIN POINTS:\n• Waking up tired and dreading the day\n• Wasted money on solutions that don't work\n• Watching others succeed while you struggle\n• Feeling stuck in the same cycle\n• Embarrassment in social situations"
    },
    {
      name: "⏰ Add Urgency Stack",
      icon: "🚨",
      action: (prompt: string) =>
        prompt + "\n\nADD URGENCY TRIGGERS:\n• Countdown timer (24 hours)\n• Limited spots counter (8 left)\n• Fake notifications (3 people bought)\n• Price increase warning (at midnight)\n• Bonus deadline (2 hours)"
    },
    {
      name: "💰 Add Price Deception",
      icon: "💸",
      action: (prompt: string) =>
        prompt + "\n\nADD PRICE DECEPTION:\n• Show original price: $997 (crossed out)\n• Today's price: $97\n• Value stack: $5,000+ value\n• Monthly equivalent: 'Just $8/month'\n• Compare to competitor: $199/month"
    },
    {
      name: "👥 Add Fake Social Proof",
      icon: "🌟",
      action: (prompt: string) =>
        prompt + "\n\nADD SOCIAL PROOF:\n• Testimonials with specific numbers (lost 28lbs, made $5,247)\n• Fake user counter (10,000+ users)\n• Authority badges (Featured in Forbes)\n• Before/After metrics with timeframes"
    },
    {
      name: "🎯 Make Aggressive",
      icon: "💥",
      action: (prompt: string) =>
        prompt.replace(/please|maybe|could|might/g, '') + 
        "\n\nMAKE COPY AGGRESSIVE:\n• Use CAPITAL LETTERS for emphasis\n• Use exclamation points!\n• Make urgent warnings: ⚠️ WARNING\n• Use fear of missing out (FOMO)\n• Be direct and commanding"
    }
  ];

  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([]);

  const handleBoosterClick = (boosterName: string, action: (p: string) => string) => {
    if (selectedBoosters.includes(boosterName)) {
      setSelectedBoosters(selectedBoosters.filter(b => b !== boosterName));
    } else {
      setSelectedBoosters([...selectedBoosters, boosterName]);
      onBoost(action(currentPrompt));
    }
  };

  return (
    <div className="psychology-booster border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span className="text-2xl">🧠</span> Psychology Boosters
      </h3>
      <p className="text-sm text-gray-600 mb-4">Add conversion triggers to your prompt:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {boosters.map((booster, idx) => (
          <button
            key={idx}
            onClick={() => handleBoosterClick(booster.name, booster.action)}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
              selectedBoosters.includes(booster.name)
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{booster.icon}</span>
            <span className="text-sm font-medium text-left">{booster.name}</span>
          </button>
        ))}
      </div>
      
      {selectedBoosters.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Added {selectedBoosters.length} psychological trigger{selectedBoosters.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Your page will now include: {selectedBoosters.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
