import { Settings as SettingsIcon, X } from 'lucide-react';
import type { Settings } from '@/lib/types';
import { scienceNotes } from '@/lib/science';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (s: Settings) => void;
}

const FIELDS: { key: keyof Settings; label: string }[] = [
  { key: 'wakeTime', label: 'Wake Time' },
  { key: 'breakfastTime', label: 'Breakfast Time' },
  { key: 'lunchTime', label: 'Lunch Time' },
  { key: 'workoutTime', label: 'Workout Time' },
  { key: 'dinnerTime', label: 'Dinner Time' },
  { key: 'sleepTime', label: 'Sleep Time' },
];

export function SettingsPanel({ open, onClose, settings, onSave }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updated: Settings = {
              ...settings,
              wakeTime: String(formData.get('wakeTime') || settings.wakeTime),
              breakfastTime: String(formData.get('breakfastTime') || settings.breakfastTime),
              lunchTime: String(formData.get('lunchTime') || settings.lunchTime),
              workoutTime: String(formData.get('workoutTime') || settings.workoutTime),
              dinnerTime: String(formData.get('dinnerTime') || settings.dinnerTime),
              sleepTime: String(formData.get('sleepTime') || settings.sleepTime),
              workoutPreference: String(formData.get('workoutPreference') || settings.workoutPreference) as Settings['workoutPreference'],
              notificationsEnabled: formData.get('notificationsEnabled') === 'on',
            };
            onSave(updated);
            onClose();
          }}
          className="space-y-4"
        >
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
              <input
                type="time"
                name={key}
                defaultValue={settings[key] as string}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-600"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5">Workout Preference</label>
            <select
              name="workoutPreference"
              defaultValue={settings.workoutPreference}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-600"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3">
            <span className="text-sm text-slate-300">Notifications</span>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                name="notificationsEnabled"
                defaultChecked={settings.notificationsEnabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-cyan-600 transition-colors">
                <div className="w-5 h-5 bg-white rounded-full mt-0.5 ml-0.5 peer-checked:translate-x-5 transition-transform" />
              </div>
            </label>
          </div>

          <div className="rounded-lg bg-slate-800/40 p-3 text-xs text-slate-500 leading-relaxed">
            <span className="text-slate-400 font-medium">Note: </span>
            {scienceNotes.mealTiming.body}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
