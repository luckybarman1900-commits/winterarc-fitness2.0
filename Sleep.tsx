import { Moon, Info } from 'lucide-react';
import { useState } from 'react';
import type { Settings } from '@/lib/types';
import { parseTime, relativeUntil, formatTime12 } from '@/lib/time';
import { scienceNotes } from '@/lib/science';

interface Props {
  settings: Settings;
  nowMin: number;
}

export function Sleep({ settings, nowMin }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const sleepMin = parseTime(settings.sleepTime);
  const windDownMin = sleepMin - 60;
  const inWindDown = nowMin >= windDownMin && nowMin < sleepMin;
  const beforeSleep = nowMin < sleepMin;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs uppercase tracking-wider text-slate-500">Sleep</h2>
        </div>
        <button onClick={() => setShowInfo((v) => !v)} className="text-slate-500 hover:text-slate-300" aria-label="Wind-down info">
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-slate-400">Bedtime</div>
          <div className="text-2xl font-light text-white">{formatTime12(settings.sleepTime)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Wake</div>
          <div className="text-2xl font-light text-white">{formatTime12(settings.wakeTime)}</div>
        </div>
      </div>

      {inWindDown && (
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-800/40 p-3 mb-3">
          <div className="text-sm font-medium text-indigo-300 mb-1">WIND-DOWN TIME</div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>Reduce stimulation (dim lights, limit screens)</li>
            <li>Prepare for sleep</li>
            <li>Keep a consistent bedtime</li>
          </ul>
        </div>
      )}

      {beforeSleep ? (
        <div className="text-sm text-slate-400">
          Time until sleep: <span className="text-white font-medium tabular-nums">{relativeUntil(sleepMin, nowMin)}</span>
        </div>
      ) : (
        <div className="text-sm text-slate-500">Bedtime has passed. Rest well.</div>
      )}

      {showInfo && (
        <div className="mt-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-medium">{scienceNotes.sleepWindDown.title}. </span>
          {scienceNotes.sleepWindDown.body}
        </div>
      )}
    </div>
  );
}
