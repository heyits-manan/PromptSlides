import { Brain, Search, Globe, BarChart3, Lightbulb } from 'lucide-react';
import type { ReasoningStep } from '@/types';

interface ReasoningBlockProps {
  step: ReasoningStep;
}

export default function ReasoningBlock({ step }: ReasoningBlockProps) {
  const getIcon = () => {
    switch (step.type) {
      case 'thinking':
        return <Brain className="w-5 h-5" />;
      case 'searching':
        return <Search className="w-5 h-5" />;
      case 'reading':
        return <Globe className="w-5 h-5" />;
      case 'analyzing':
        return <BarChart3 className="w-5 h-5" />;
      case 'generating':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getIconColor = () => {
    switch (step.type) {
      case 'thinking':
        return 'text-purple-600';
      case 'searching':
        return 'text-blue-600';
      case 'reading':
        return 'text-green-600';
      case 'analyzing':
        return 'text-orange-600';
      case 'generating':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{step.content}</p>
        </div>
      </div>
    </div>
  );
}
