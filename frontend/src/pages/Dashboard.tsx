import React from 'react';
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const overview = [
  { label: 'Total Employees', value: '248', delta: '+12%', icon: Users, tone: 'text-sky-600' },
  { label: 'Active Projects', value: '36', delta: '+4%', icon: FileText, tone: 'text-violet-600' },
  { label: 'Pending Leaves', value: '18', delta: '-7%', icon: CalendarClock, tone: 'text-amber-600' },
  { label: 'Attendance', value: '96.4%', delta: '+1.2%', icon: ShieldCheck, tone: 'text-emerald-600' },
];

const activityData = [
  { day: 'Mon', revenue: 42, expense: 18 },
  { day: 'Tue', revenue: 58, expense: 24 },
  { day: 'Wed', revenue: 51, expense: 22 },
  { day: 'Thu', revenue: 69, expense: 27 },
  { day: 'Fri', revenue: 63, expense: 31 },
  { day: 'Sat', revenue: 74, expense: 28 },
  { day: 'Sun', revenue: 66, expense: 20 },
];

const departmentData = [
  { name: 'Engineering', value: 82, color: '#6366f1' },
  { name: 'HR', value: 26, color: '#0ea5e9' },
  { name: 'Sales', value: 49, color: '#22c55e' },
  { name: 'Finance', value: 31, color: '#f59e0b' },
];

const recentItems = [
  { title: 'Leave request approved', meta: 'Priya Sharma · 2 hours ago', status: 'Approved' },
  { title: 'New employee onboarding', meta: 'Niraj Patel · 5 hours ago', status: 'In progress' },
  { title: 'Payroll batch completed', meta: 'Finance team · Today', status: 'Done' },
  { title: 'Policy acknowledgement pending', meta: '4 employees remaining', status: 'Pending' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* <section className="grid gap-4 xl:grid-cols-[1.7fr_0.9fr]">
        <Card className="overflow-hidden border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_12px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-primary">HRM Dashboard</span>
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-4 w-4" /> Live overview
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">People operations made simple</h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    A clean, professional HR workspace with quick insight cards, employee activity, and responsive navigation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2 rounded-full px-5">
                    <ArrowUpRight className="h-4 w-4" />
                    View analytics
                  </Button>
                  <Button variant="outline" className="rounded-full px-5">
                    Export report
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                {[
                  { label: 'Present', value: '94.8%', icon: CheckCircle2 },
                  { label: 'Late logins', value: '12', icon: Clock3 },
                  { label: 'Tasks today', value: '28', icon: FileText },
                  { label: 'Open issues', value: '06', icon: Activity },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                    <item.icon className="mb-3 h-5 w-5 text-primary" />
                    <div className="text-2xl font-semibold text-slate-900">{item.value}</div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 shadow-[0_12px_50px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Search</CardTitle>
            <CardDescription>Find employees, payroll, or leave records fast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-xl pl-10" placeholder="Search HR records..." />
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl border bg-slate-50/70 p-4">
                  <div>
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.meta}</div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section> */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => (
          <Card key={item.label} className="border-slate-200/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{item.label}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {item.delta} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-slate-200/70 shadow-[0_12px_50px_rgba(15,23,42,0.06)]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Operations Trend</CardTitle>
              <CardDescription>Weekly movement across activity and cost.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              This week
            </Button>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: '1px solid rgba(148,163,184,0.25)',
                    boxShadow: '0 20px 40px rgba(15,23,42,0.12)',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#revenueGradient)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 shadow-[0_12px_50px_rgba(15,23,42,0.06)]">
          <CardHeader>
            <CardTitle className="text-lg">Department Split</CardTitle>
            <CardDescription>Headcount distribution across teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.18)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 999, 999, 0]} barSize={16}>
                    {departmentData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {departmentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200/70 shadow-[0_12px_50px_rgba(15,23,42,0.06)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest HR updates and approvals.</CardDescription>
          </div>
          <Button variant="ghost" className="gap-2 text-slate-600">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'New hires', value: '08', note: 'This month' },
            { title: 'Approved leaves', value: '24', note: 'Last 7 days' },
            { title: 'Payroll ready', value: '100%', note: 'No blockers' },
            { title: 'Policy read rate', value: '87%', note: 'Across teams' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-muted-foreground">{item.title}</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</div>
              <div className="mt-1 text-xs text-slate-500">{item.note}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
