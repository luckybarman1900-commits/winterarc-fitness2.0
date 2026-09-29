import { Snowflake } from 'lucide-react';
import { formatDateLong, formatClock } from '@/lib/time';

interface Props {
  now: Date;
}

export function Clock({ now }: Props) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Snowflake className="w-6 h-6 text-cyan-400" />
        <span className="text-sm tracking-[0.4em] text-slate-400 font-medium">WINTER ARC</span>
        <Snowflake className="w-6 h-6 text-cyan-400" />
      </div>
      <div className="text-5xl sm:text-6xl font-extralight text-white tabular-nums tracking-tight">
        {formatClock(now)}
      </div>
      <div className="mt-2 text-slate-400 text-sm sm:text-base">{formatDateLong(now)}</div>
    </div>
  );
}
