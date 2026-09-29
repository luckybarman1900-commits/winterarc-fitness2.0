import { useState } from 'react';
import { Dumbbell, Play, Check, Info } from 'lucide-react';
import { scienceNotes } from '@/lib/science';

interface Props {
  onComplete: () => void;
  isActive: boolean;
}

const PHASES = [
  {
    id: 'warmup',
    label: 'Warm-up',
    items: ['5 min light cardio (jumping jacks, brisk walk)', 'Dynamic stretches (leg swings, arm circles)', 'Ease into movement'],
  },
  {
    id: 'workout',
    label: 'Workout',
    items: ['20–40 min main session', 'Choose your focus: strength, cardio, or mobility', 'Keep good form over intensity'],
  },
  {
    id: 'cooldown',
    label: 'Cool-down',
    items: ['5 min easy walking', 'Static stretches (hold 20–30 sec)', 'Reflect on the session'],
  },
];

export function Workout({ onComplete, isActive }: Props) {
  const [open, setOpen] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const handleStart = () => {
    setOpen(true);
    setPhaseIdx(0);
  };

  const handleNext = () => {
    if (phaseIdx < PHASES.length - 1) {
      setPhaseIdx((i) => i + 1);
    } else {
      onComplete();
      setOpen(false);
      setPhaseIdx(0);
    }
  };

  if (!open) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-400" />
            <h2 className="text-xs uppercase tracking-wider text-slate-500">Workout</h2>
          </div>
          <button onClick={() => setShowInfo((v) => !v)} className="text-slate-500 hover:text-slate-300" aria-label="Workout timing info">
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {showInfo && (
          <div className="mb-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium">{scienceNotes.workoutTiming.title}. </span>
            {scienceNotes.workoutTiming.body}
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500/15 border border-orange-700/50 py-3 text-sm font-medium text-orange-300 transition-colors hover:bg-orange-500/25"
        >
          <Play className="w-4 h-4" /> Start Workout
        </button>
        {!isActive && (
          <p className="text-xs text-slate-600 mt-2 text-center">Warm-up → Workout → Cool-down guidance</p>
        )}
      </div>
    );
  }

  const phase = PHASES[phaseIdx];
  const isLast = phaseIdx === PHASES.length - 1;

  return (
    <div className="rounded-2xl border border-orange-800/40 bg-slate-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="w-4 h-4 text-orange-400" />
        <h2 className="text-xs uppercase tracking-wider text-slate-500">Workout Session</h2>
      </div>

      <div className="flex items-center gap-1 mb-5">
        {PHASES.map((p, i) => (
          <div key={p.id} className="flex-1">
            <div
              className={`h-1 rounded-full transition-colors ${i <= phaseIdx ? 'bg-orange-400' : 'bg-slate-800'}`}
            />
            <div className={`text-xs mt-1.5 ${i === phaseIdx ? 'text-orange-300' : 'text-slate-600'}`}>{p.label}</div>
          </div>
        ))}
      </div>

      <ul className="space-y-2 mb-5">
        {phase.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <button
        onClick={handleNext}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500/15 border border-orange-700/50 py-2.5 text-sm font-medium text-orange-300 transition-colors hover:bg-orange-500/25"
      >
        {isLast ? (
          <>
            <Check className="w-4 h-4" /> Complete Workout
          </>
        ) : (
          <>Next Phase</>
        )}
      </button>
    </div>
  );
}
