import { useEffect, useRef, useState } from 'react';
import { Footprints, Play, Pause, RotateCcw, Info } from 'lucide-react';
import { formatDuration } from '@/lib/time';
import { scienceNotes } from '@/lib/science';

interface Props {
  onComplete: () => void;
  autoOpen: boolean;
}

const DEFAULT_SECONDS = 15 * 60; // 15-minute walk

export function WalkTimer({ onComplete, autoOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(DEFAULT_SECONDS);
  const [running, setRunning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef<number>(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  useEffect(() => {
    if (running) {
      completedRef.current = false;
      endRef.current = Date.now() + remaining * 1000;
      intervalRef.current = setInterval(() => {
        const secs = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
        setRemaining(secs);
        if (secs <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current();
          }
        }
      }, 300);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setRemaining(DEFAULT_SECONDS);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-colors hover:border-slate-700"
      >
        <div className="flex items-center gap-3">
          <Footprints className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-sm font-medium text-white">Post-meal Walk Timer</div>
            <div className="text-xs text-slate-500">A relaxed 10–20 minute walk</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs uppercase tracking-wider text-slate-500">Walk Timer</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInfo((v) => !v)} className="text-slate-500 hover:text-slate-300" aria-label="Why walk">
            <Info className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-xs">Close</button>
        </div>
      </div>

      {showInfo && (
        <div className="mb-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">{scienceNotes.postMealWalk.title}. </span>
          {scienceNotes.postMealWalk.body}
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-5xl font-extralight text-white tabular-nums">{formatDuration(remaining)}</div>
        <div className="text-xs text-slate-500 mt-1">{running ? 'Walking...' : remaining === 0 ? 'Complete' : 'Ready'}</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500/15 border border-cyan-700/50 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/25 disabled:opacity-40"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
