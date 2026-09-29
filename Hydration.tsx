import { Droplets, Plus, Minus, Info } from 'lucide-react';
import { useState } from 'react';
import { scienceNotes } from '@/lib/science';

interface Props {
  glasses: number;
  onAdd: (delta: number) => void;
}

export function Hydration({ glasses, onAdd }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs uppercase tracking-wider text-slate-500">Hydration</h2>
        </div>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Hydration info"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">{scienceNotes.hydration.title}. </span>
          {scienceNotes.hydration.body}
        </div>
      )}

      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-4xl font-light text-white tabular-nums">{glasses}</span>
          <span className="text-slate-500 text-sm ml-2">glasses today</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAdd(-1)}
          disabled={glasses <= 0}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAdd(1)}
          className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-blue-500/15 border border-blue-700/50 py-2.5 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/25"
        >
          <Plus className="w-4 h-4" /> Add Glass
        </button>
      </div>
    </div>
  );
}
