import { CheckCircle2, Circle, Footprints } from 'lucide-react';
import type { DailyProgress } from '@/lib/types';
import { scienceNotes } from '@/lib/science';

interface Props {
  mealId: 'breakfast' | 'lunch' | 'dinner';
  label: string;
  time: string;
  done: boolean;
  onToggle: () => void;
  onWalk: () => void;
  walkDone: boolean;
  isNow: boolean;
}

export function MealCard({ mealId, label, time, done, onToggle, onWalk, walkDone, isNow }: Props) {
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${isNow ? 'border-cyan-800/50 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-slate-500">{time}</div>
        </div>
        <button onClick={onToggle} className="transition-transform active:scale-90" aria-label={`Toggle ${label}`}>
          {done ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
          )}
        </button>
      </div>

      {done && (
        <div className="mt-2 space-y-2">
          <div className="rounded-lg bg-slate-800/60 p-2.5 text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium">Post-meal: </span>
            Stay upright and consider a relaxed 10–20 min walk. {scienceNotes.postMealWalk.body.split('.')[0]}.
          </div>
          <button
            onClick={onWalk}
            disabled={walkDone}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-colors ${
              walkDone
                ? 'bg-emerald-500/10 border border-emerald-800/40 text-emerald-400'
                : 'bg-cyan-500/10 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-500/20'
            }`}
          >
            <Footprints className="w-4 h-4" />
            {walkDone ? 'Walk Done' : 'Start Walk Timer'}
          </button>
        </div>
      )}

      {isNow && !done && (
        <div className="mt-2 text-xs text-cyan-400 font-medium animate-pulse">Time to eat</div>
      )}
    </div>
  );
}
