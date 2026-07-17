import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWorkReportService } from '@/services/reportService/reportService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Loader2, Clock, Coffee, ChevronDown, ChevronUp, Timer } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-blue-500',
  low:    'bg-slate-400',
};

const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  completed:   'success',
  in_progress: 'info',
  paused:      'warning',
  todo:        'default',
  running:     'success',
  cancelled:   'danger',
};

const today = () => new Date().toISOString().split('T')[0];

// ── sub-components ────────────────────────────────────────────────────────────
const BreakRow = ({ brk }: { brk: any }) => (
  <div className="flex items-center gap-4 py-1.5 pl-4 text-xs text-muted-foreground border-l-2 border-yellow-500/40">
    <Coffee className="h-3 w-3 text-yellow-500 shrink-0" />
    <span className="w-20 font-mono">{brk.from}</span>
    <span className="text-muted-foreground/50">→</span>
    <span className="w-20 font-mono">
      {brk.to === 'Active'
        ? <span className="text-yellow-500 font-semibold animate-pulse">Active</span>
        : brk.to}
    </span>
    <span className="ml-auto font-mono font-medium text-yellow-600">{brk.total}</span>
  </div>
);

const SessionRow = ({ seg }: { seg: any }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border/50 bg-muted/30 overflow-hidden">
      {/* session header row */}
      <div
        className="flex items-center gap-4 px-4 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors"
        onClick={() => seg.breaks.length > 0 && setOpen(o => !o)}
      >
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {/* From */}
        <div className="flex flex-col min-w-[80px]">
          <span className="text-[10px] text-muted-foreground">From</span>
          <span className="font-mono text-sm font-medium">{seg.from}</span>
        </div>
        <span className="text-muted-foreground">→</span>
        {/* To */}
        <div className="flex flex-col min-w-[80px]">
          <span className="text-[10px] text-muted-foreground">To</span>
          <span className="font-mono text-sm font-medium">
            {seg.to === 'Active'
              ? <span className="text-emerald-500 animate-pulse font-semibold">Active</span>
              : seg.to}
          </span>
        </div>
        {/* net total */}
        <div className="flex flex-col ml-6 min-w-[80px]">
          <span className="text-[10px] text-muted-foreground">Net Total</span>
          <span className="font-mono text-sm font-semibold text-primary">{seg.total}</span>
        </div>
        {/* breaks count */}
        {seg.breaks.length > 0 && (
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Coffee className="h-3 w-3" />
            {seg.breaks.length} break{seg.breaks.length > 1 ? 's' : ''}
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </div>
        )}
      </div>

      {/* breaks list */}
      {open && seg.breaks.length > 0 && (
        <div className="px-4 pb-3 space-y-1 border-t border-border/40 pt-2">
          <div className="grid grid-cols-4 gap-2 px-4 text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wide">
            <span>From</span><span>To</span><span>Duration</span>
          </div>
          {seg.breaks.map((brk: any) => <BreakRow key={brk.id} brk={brk} />)}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task }: { task: any }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      {/* task header */}
      <div
        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {/* priority dot */}
        <span className={`h-3 w-3 rounded-sm shrink-0 ${PRIORITY_COLORS[task.priority] ?? 'bg-slate-400'}`} />
        {/* status */}
        <StatusBadge
          label={task.taskStatus.replace('_', ' ')}
          variant={STATUS_VARIANT[task.taskStatus] ?? 'default'}
        />
        {/* task + project name */}
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="font-semibold text-sm truncate">{task.taskName}</span>
          <span className="text-xs text-muted-foreground truncate">{task.project?.name}</span>
        </div>
        {/* task total */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Timer className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
            {task.taskTotal}
          </span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>

      {/* sessions */}
      {open && (
        <div className="px-5 pb-4 pt-2 space-y-2 border-t border-border/40">
          {/* column headers */}
          <div className="grid grid-cols-4 gap-2 px-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
            <span>From</span><span>To</span><span>Net Total</span><span>Breaks</span>
          </div>
          {task.sessions.map((seg: any) => <SessionRow key={seg.sessionId} seg={seg} />)}
        </div>
      )}
    </div>
  );
};

const DaySection = ({ day }: { day: any }) => {
  const label = new Date(day.date).toLocaleDateString('en-PK', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  return (
    <div className="space-y-3">
      {/* day header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-base text-foreground">{label}</h3>
        <span className="font-mono font-bold text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full">
          {day.dayTotal}
        </span>
      </div>
      {day.tasks.map((task: any) => <TaskCard key={task.taskId} task={task} />)}
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────────────────────
export const WorkReport = () => {
  const [startDate, setStartDate] = useState(today());
  const [endDate,   setEndDate]   = useState(today());
  const [applied, setApplied]     = useState({ startDate: today(), endDate: today() });

  const { data, isLoading, error } = useQuery({
    queryKey: ['workReport', applied.startDate, applied.endDate],
    queryFn: () => fetchWorkReportService({ startDate: applied.startDate, endDate: applied.endDate }),
  });

  const report = data?.data;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* ── header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Activity</h2>
          {report?.grandTotal && (
            <p className="text-muted-foreground text-sm mt-0.5">
              Grand total: <span className="font-mono font-semibold text-foreground">{report.grandTotal}</span>
            </p>
          )}
        </div>

        {/* date range filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">From</span>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[160px]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">To</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[160px]" />
          </div>
          <Button
            className="mt-4"
            onClick={() => setApplied({ startDate, endDate })}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* ── body ── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-red-500">Failed to load work report.</CardContent>
        </Card>
      ) : !report?.days?.length ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No work sessions found for the selected date range.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {report.days.map((day: any) => <DaySection key={day.date} day={day} />)}
        </div>
      )}
    </div>
  );
};
