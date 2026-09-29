import * as Icons from 'lucide-react';
import type { RoutineBlock } from '@/lib/types';
import type { DailyProgress } from '@/lib/types';
import { parseTime, relativeUntil, formatTime12 } from '@/lib/time';

interface Props {
  blocks: RoutineBlock[];
  nowMin: number;
  progress: DailyProgress;
}

export function Timeline({ blocks, nowMin, progress }: Props) {
  const sorted = [...blocks].sort((a, b) => parseTime(a.time) - parseTime(b.time));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-4">Today's Timeline</h2>
      <div className="space-y-1">
        {sorted.map((b, i) => {
          const t = parseTime(b.time);
          const isPast = t <= nowMin;
          const isNext = sorted.slice(0, i).every((p) => parseTime(p.time) <= nowMin) && t > nowMin;
          const isCurrent = isPast && (i === sorted.length - 1 || parseTime(sorted[i + 1].time) > nowMin);
          const done = progress[b.id] === true;
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[b.icon] ?? Icons.Circle;

          return (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isCurrent ? 'bg-cyan-500/10 border border-cyan-800/50' : 'border border-transparent'
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                  done
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : isCurrent
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : isPast
                    ? 'bg-slate-800 text-slate-600'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {done ? <Icons.Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    done ? 'text-emerald-400' : isCurrent ? 'text-white' : isPast ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {b.label}
                </div>
                <div className="text-xs text-slate-500">{formatTime12(b.time)}</div>
              </div>
              {isNext && (
                <div className="text-xs text-cyan-400 font-medium tabular-nums">{relativeUntil(t, nowMin)}</div>
              )}
              {isCurrent && <div className="text-xs text-cyan-400 font-medium uppercase tracking-wider">Now</div>}
              {done && !isCurrent && (
                <div className="text-xs text-emerald-500/70 uppercase tracking-wider">Done</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
