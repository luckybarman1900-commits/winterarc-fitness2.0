import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Settings as SettingsIcon, Info } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Settings, DailyProgress, HydrationData } from '@/lib/types';
import { buildRoutine, resolveRoutine, TRACKED_ACTIVITIES, dayProgress } from '@/lib/routine';
import { currentMinutes, parseTime, todayStr } from '@/lib/time';
import { requestNotificationPermission, sendNotification } from '@/lib/notifications';
import { scienceNotes } from '@/lib/science';

import { Clock } from '@/components/Clock';
import { WhatNow } from '@/components/WhatNow';
import { Timeline } from '@/components/Timeline';
import { ProgressCard } from '@/components/ProgressCard';
import { Hydration } from '@/components/Hydration';
import { WalkTimer } from '@/components/WalkTimer';
import { Workout } from '@/components/Workout';
import { Sleep } from '@/components/Sleep';
import { SettingsPanel } from '@/components/SettingsPanel';
import { MealCard } from '@/components/MealCard';

const DEFAULT_SETTINGS: Settings = {
  wakeTime: '06:30',
  breakfastTime: '07:00',
  lunchTime: '12:30',
  workoutTime: '17:30',
  workoutPreference: 'flexible',
  dinnerTime: '19:00',
  sleepTime: '22:30',
  notificationsEnabled: false,
};

const EMPTY_PROGRESS: DailyProgress = {
  breakfast: false,
  lunch: false,
  postMealWalk: false,
  workout: false,
  dinner: false,
  windDown: false,
};

function emptyProgress(): DailyProgress {
  return { ...EMPTY_PROGRESS };
}

export default function App() {
  const now = useClock();
  const [settings, setSettings] = useLocalStorage<Settings>('wa_settings', DEFAULT_SETTINGS);
  const [progress, setProgress] = useLocalStorage<DailyProgress>('wa_progress_' + todayStr(now), emptyProgress());
  const [streak, setStreak] = useLocalStorage<number>('wa_streak', 0);
  const [lastCompleteDate, setLastCompleteDate] = useLocalStorage<string>('wa_lastCompleteDate', '');
  const [hydration, setHydration] = useLocalStorage<HydrationData>('wa_hydration', {
    date: todayStr(now),
    glasses: 0,
  });
  const [walkTarget, setWalkTarget] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const nowMin = currentMinutes(now);
  const today = todayStr(now);
  const routine = useMemo(() => buildRoutine(settings), [settings]);
  const { current, next, nextMinutes } = resolveRoutine(routine, nowMin);

  // --- Reset daily progress / hydration when day changes ---
  const progressKey = 'wa_progress_' + today;
  const lastDayRef = useRef(today);
  useEffect(() => {
    if (lastDayRef.current !== today) {
      lastDayRef.current = today;
      setProgress(emptyProgress());
      if (hydration.date !== today) {
        setHydration({ date: today, glasses: 0 });
      }
    }
  }, [today, hydration.date, setProgress, setHydration]);

  // --- Streak logic: if yesterday was fully complete, streak continues; if all done today, bump ---
  const allDone = TRACKED_ACTIVITIES.every((a) => progress[a]);
  useEffect(() => {
    if (allDone && lastCompleteDate !== today) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = todayStr(yesterday);
      if (lastCompleteDate === yStr) {
        setStreak((s) => s + 1);
      } else {
        setStreak(1);
      }
      setLastCompleteDate(today);
    }
  }, [allDone, lastCompleteDate, today, now, setStreak, setLastCompleteDate]);

  // --- Hydration helpers ---
  const addWater = useCallback(
    (delta: number) => {
      setHydration((prev) => {
        const base = prev.date === today ? prev.glasses : 0;
        return { date: today, glasses: Math.max(0, base + delta) };
      });
    },
    [setHydration, today],
  );

  // --- Progress toggles ---
  const toggleActivity = useCallback(
    (id: string) => {
      setProgress((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    [setProgress],
  );

  const completeActivity = useCallback(
    (id: string) => {
      setProgress((prev) => ({ ...prev, [id]: true }));
    },
    [setProgress],
  );

  // --- Notification permission ---
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [settings.notificationsEnabled]);

  // --- Fire notifications when an activity time arrives ---
  const firedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    const keyBase = today;
    const checks: { id: string; time: string; title: string; body: string }[] = [
      { id: 'breakfast', time: settings.breakfastTime, title: 'Breakfast Time', body: 'Time for your recommended breakfast window.' },
      { id: 'lunch', time: settings.lunchTime, title: 'Lunch Time', body: 'Time for your recommended lunch window.' },
      { id: 'postMealWalk', time: settings.lunchTime, title: 'Post-meal Walk', body: 'Consider a relaxed 10–20 minute walk after your meal.' },
      { id: 'workout', time: settings.workoutTime, title: 'Workout Time', body: 'Your workout window is here. Time to move.' },
      { id: 'dinner', time: settings.dinnerTime, title: 'Dinner Time', body: 'Time for your recommended dinner window.' },
      { id: 'windDown', time: minutesToTimeStr(parseTime(settings.sleepTime) - 60), title: 'Wind-down Time', body: 'Reduce stimulation and prepare for sleep.' },
    ];
    for (const c of checks) {
      const fireKey = `${keyBase}_${c.id}`;
      if (nowMin >= parseTime(c.time) && !firedRef.current.has(fireKey)) {
        firedRef.current.add(fireKey);
        sendNotification(c.title, c.body);
      }
    }
  }, [nowMin, settings, today, settings.notificationsEnabled]);

  // --- On-screen reminder state ---
  const reminder = useMemo(() => {
    const checks: { id: string; time: string; msg: string }[] = [
      { id: 'breakfast', time: settings.breakfastTime, msg: 'Breakfast time — eat within your recommended window.' },
      { id: 'lunch', time: settings.lunchTime, msg: 'Lunch time — eat within your recommended window.' },
      { id: 'workout', time: settings.workoutTime, msg: 'Workout time — tap Start Workout.' },
      { id: 'dinner', time: settings.dinnerTime, msg: 'Dinner time — eat within your recommended window.' },
    ];
    for (const c of checks) {
      const t = parseTime(c.time);
      if (nowMin >= t && nowMin < t + 30 && !progress[c.id]) {
        return c.msg;
      }
    }
    // Wind-down
    const windDown = parseTime(settings.sleepTime) - 60;
    if (nowMin >= windDown && nowMin < windDown + 30 && !progress.windDown) {
      return 'Wind-down time — reduce stimulation and prepare for sleep.';
    }
    // Post-meal walk
    if (progress.lunch && !progress.postMealWalk && nowMin >= parseTime(settings.lunchTime) + 5 && nowMin < parseTime(settings.lunchTime) + 60) {
      return 'Take a relaxed 10–20 minute walk after your meal.';
    }
    return null;
  }, [nowMin, settings, progress]);

  const dayPct = Math.round(dayProgress(settings.wakeTime, settings.sleepTime, nowMin) * 100);

  const handleSaveSettings = (s: Settings) => {
    setSettings(s);
    if (s.notificationsEnabled) {
      requestNotificationPermission();
    }
  };

  // --- Missed activity adaptive message ---
  const missedMessage = useMemo(() => {
    if (!current) return null;
    const t = parseTime(current.time);
    // If current activity is past its window by > 30 min and not done
    if (nowMin > t + 30 && !progress[current.id] && TRACKED_ACTIVITIES.includes(current.id as typeof TRACKED_ACTIVITIES[number])) {
      return 'You missed your planned time. That\'s okay. Continue with your next activity.';
    }
    return null;
  }, [current, nowMin, progress]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => setInfoOpen(true)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">About</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Settings</span>
          </button>
        </header>

        {/* Clock */}
        <Clock now={now} />

        {/* Day progress bar */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Day Progress</span>
            <span className="text-xs text-slate-400 tabular-nums">{dayPct}%</span>
          </div>
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-1000"
              style={{ width: `${dayPct}%` }}
            />
          </div>
        </div>

        {/* What Now + Next activity */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-2">
            <WhatNow now={now} settings={settings} progress={progress} />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Next Activity</div>
            {next ? (
              <>
                <div className="text-lg font-medium text-white">{next.label}</div>
                <div className="text-sm text-slate-400 mt-0.5">
                  {nextMinutes != null && nextMinutes > 0
                    ? `in ${Math.floor(nextMinutes / 60) > 0 ? `${Math.floor(nextMinutes / 60)} hr ` : ''}${nextMinutes % 60} min`
                    : 'soon'}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">No more activities today.</div>
            )}
            {current && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-500">Currently</div>
                <div className="text-sm text-cyan-400">{current.label}</div>
              </div>
            )}
          </div>
        </div>

        {/* On-screen reminder */}
        {reminder && (
          <div className="mb-6 rounded-2xl border border-cyan-800/50 bg-cyan-500/5 p-4 text-sm text-cyan-300 flex items-center gap-3 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            {reminder}
          </div>
        )}

        {/* Missed activity message */}
        {missedMessage && (
          <div className="mb-6 rounded-xl border border-amber-900/40 bg-amber-500/5 p-3 text-sm text-amber-300/80">
            {missedMessage}
          </div>
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Left: Timeline */}
          <div className="lg:col-span-1">
            <Timeline blocks={routine} nowMin={nowMin} progress={progress} />
          </div>

          {/* Middle: Meals + Workout */}
          <div className="lg:col-span-1 space-y-4">
            <MealCard
              mealId="breakfast"
              label="Breakfast"
              time={formatTime12Safe(settings.breakfastTime)}
              done={progress.breakfast}
              onToggle={() => toggleActivity('breakfast')}
              onWalk={() => setWalkTarget('breakfast')}
              walkDone={progress.postMealWalk}
              isNow={nowMin >= parseTime(settings.breakfastTime) && nowMin < parseTime(settings.breakfastTime) + 30}
            />
            <MealCard
              mealId="lunch"
              label="Lunch"
              time={formatTime12Safe(settings.lunchTime)}
              done={progress.lunch}
              onToggle={() => toggleActivity('lunch')}
              onWalk={() => setWalkTarget('lunch')}
              walkDone={progress.postMealWalk}
              isNow={nowMin >= parseTime(settings.lunchTime) && nowMin < parseTime(settings.lunchTime) + 30}
            />
            <MealCard
              mealId="dinner"
              label="Dinner"
              time={formatTime12Safe(settings.dinnerTime)}
              done={progress.dinner}
              onToggle={() => toggleActivity('dinner')}
              onWalk={() => setWalkTarget('dinner')}
              walkDone={progress.postMealWalk}
              isNow={nowMin >= parseTime(settings.dinnerTime) && nowMin < parseTime(settings.dinnerTime) + 30}
            />
          </div>

          {/* Right: Workout + Sleep + Hydration */}
          <div className="lg:col-span-1 space-y-4">
            <Workout
              isActive={nowMin >= parseTime(settings.workoutTime) && nowMin < parseTime(settings.workoutTime) + 60}
              onComplete={() => completeActivity('workout')}
            />
            <Sleep settings={settings} nowMin={nowMin} />
            <Hydration glasses={hydration.date === today ? hydration.glasses : 0} onAdd={addWater} />
          </div>
        </div>

        {/* Walk Timer (auto-opens when a meal is marked and walk started) */}
        <div className="mb-6">
          <WalkTimer
            autoOpen={walkTarget !== null}
            onComplete={() => {
              completeActivity('postMealWalk');
              setWalkTarget(null);
            }}
          />
        </div>

        {/* Progress */}
        <ProgressCard progress={progress} streak={streak} />

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-600">
          <p>WINTER ARC — Personal daily fitness command center.</p>
          <p className="mt-1">General fitness & lifestyle guidance. Not medical advice.</p>
        </footer>
      </div>

      {/* Settings modal */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* About / Science modal */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInfoOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">About WINTER ARC</h2>
              <button onClick={() => setInfoOpen(false)} className="text-slate-400 hover:text-white text-sm">Close</button>
            </div>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <p>WINTER ARC is a simple personal daily fitness command center. It helps you follow a science-informed daily routine with live timing, reminders, and progress tracking.</p>
              {Object.values(scienceNotes).map((note) => (
                <div key={note.title}>
                  <div className="text-slate-200 font-medium mb-0.5">{note.title}</div>
                  <p className="text-xs">{note.body}</p>
                </div>
              ))}
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-800">This app is for general fitness and lifestyle guidance. It is not medical advice. Always consult a qualified professional for personal health decisions.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function minutesToTimeStr(min: number): string {
  const wrapped = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

function formatTime12Safe(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`;
}
