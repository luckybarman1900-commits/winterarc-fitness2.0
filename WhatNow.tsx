import { Sparkles } from 'lucide-react';
import { whatShouldIDoNow } from '@/lib/whatNow';
import type { DailyProgress, Settings } from '@/lib/types';

interface Props {
  now: Date;
  settings: Settings;
  progress: DailyProgress;
}

export function WhatNow({ now, settings, progress }: Props) {
  const { headline, detail } = whatShouldIDoNow(now, settings, progress);
  return (
    <button
      onClick={() => {}}
      className="w-full text-left group"
      aria-label="What should I do now"
    >
      <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 transition-colors hover:border-cyan-900">
        <div className="mt-0.5 shrink-0 rounded-xl bg-cyan-500/10 p-2.5">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-cyan-400 mb-1">What should I do now</div>
          <div className="text-xl font-medium text-white leading-snug">{headline}</div>
          <div className="text-sm text-slate-400 mt-1">{detail}</div>
        </div>
      </div>
    </button>
  );
}
