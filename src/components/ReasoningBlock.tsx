import { Brain, Search, Globe, BarChart3, Lightbulb } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReasoningStep } from '@/types';

interface ReasoningBlockProps {
  step: ReasoningStep;
  isActive?: boolean;
  isLast?: boolean;
}

const STEP_STYLES: Record<
  ReasoningStep['type'],
  {
    icon: LucideIcon;
    accent: string;
  }
> = {
  thinking: {
    icon: Brain,
    accent: 'text-slate-600',
  },
  searching: {
    icon: Search,
    accent: 'text-slate-600',
  },
  reading: {
    icon: Globe,
    accent: 'text-slate-600',
  },
  analyzing: {
    icon: BarChart3,
    accent: 'text-slate-600',
  },
  generating: {
    icon: Lightbulb,
    accent: 'text-slate-600',
  },
};

export default function ReasoningBlock({ step, isActive = false, isLast = false }: ReasoningBlockProps) {
  const style = STEP_STYLES[step.type];
  const Icon = style.icon;

  return (
    <div className="relative pl-12">
      {!isLast && (
        <div className="absolute left-6 top-10 bottom-0 w-px bg-slate-200" />
      )}

      <div
        className={`relative bg-white border border-slate-200 rounded-xl px-6 py-5 shadow-sm transition-all ${
          isActive ? 'border-[#2563eb] shadow-[0_12px_32px_rgba(15,23,42,0.08)]' : ''
        }`}
      >
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 ${
              isActive ? 'border-[#2563eb] text-[#2563eb]' : ''
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-3">
          <span className={`text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 ${style.accent}`}>
            {step.title}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {step.content}
        </p>

        {isActive && (
          <div className="mt-3 text-xs font-medium text-[#2563eb]">
            Refining response…
          </div>
        )}
      </div>
    </div>
  );
}
