import { TrendingUp, Flame } from 'lucide-react';
import { TRACKED_ACTIVITIES } from '@/lib/routine';
import type { DailyProgress } from '@/lib/types';

interface Props {
  progress: DailyProgress;
  streak: number;
}

export function ProgressCard({ progress, streak }: Props) {
  const total = TRACKED_ACTIVITIES.length;
  const done = TRACKED_ACTIVITIES.filter((a) => progress[a]).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs uppercase tracking-wider text-slate-500">Daily Progress</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-slate-300 tabular-nums">{streak}</span>
          <span className="text-xs text-slate-500">day streak</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-light text-white tabular-nums">{pct}%</span>
        <span className="text-sm text-slate-500">{done} of {total} done</span>
      </div>

      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
