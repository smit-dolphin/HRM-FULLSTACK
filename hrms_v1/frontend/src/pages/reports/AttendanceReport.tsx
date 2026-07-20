import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendanceReportService } from '@/services/reportService/reportService';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const AttendanceReport = () => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // ── Week helpers ──────────────────────────────────────────────────────────
  const getWeekStart = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() - (day - 1));
    return d;
  };
  const getWeekEnd = (dateStr: string) => {
    const s = getWeekStart(dateStr);
    s.setDate(s.getDate() + 6);
    return s;
  };
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const shiftWeek = (dir: 1 | -1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Convert YYYY-W## (from <input type="week">) → Monday's ISO date string
  const weekInputToDate = (weekVal: string) => {
    const [year, week] = weekVal.split('-W').map(Number);
    // ISO week 1 = week containing first Thursday
    const jan4 = new Date(year, 0, 4);
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
    return monday.toISOString().split('T')[0];
  };

  // Convert current selectedDate → YYYY-Www for the input value
  const dateToWeekInput = (dateStr: string) => {
    const d = getWeekStart(dateStr);
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const weekNum = Math.round((d.getTime() - startOfWeek1.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  };
  // ─────────────────────────────────────────────────────────────────────────

  const { data, isLoading, error } = useQuery({
    queryKey: ['attendanceReport', reportType, selectedDate],
    queryFn: () => fetchAttendanceReportService({ type: reportType, date: selectedDate }),
  });

  const rawData = data?.data?.data;
  const reportData: any[] = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Attendance Dashboard</h2>

        {/* ── Daily filter ── */}
        {reportType === 'daily' && (
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[180px]"
          />
        )}

        {/* ── Weekly range navigation + calendar ── */}
        {reportType === 'weekly' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => shiftWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Native week calendar — opens a week-grid picker */}
            <div className="relative">
              <Input
                type="week"
                value={dateToWeekInput(selectedDate)}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(weekInputToDate(e.target.value));
                }}
                className="w-[200px] cursor-pointer"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => shiftWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Monthly filter ── */}
        {reportType === 'monthly' && (
          <Input
            type="month"
            value={selectedDate.substring(0, 7)}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDate(val.length === 7 ? val + '-01' : val);
            }}
            className="w-[180px]"
          />
        )}
      </div>

      <Tabs defaultValue="daily" value={reportType} onValueChange={(val) => setReportType(val as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Attendance</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Attendance</TabsTrigger>
        </TabsList>
        
        <Card>
            <CardHeader>
                <CardTitle>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-10">Failed to load report data.</div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            {reportType === 'daily' && (
                                <>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Dept / Designation</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Entry</TableHead>
                                            <TableHead>Exit</TableHead>
                                            <TableHead>Total Hours</TableHead>
                                            <TableHead>Last Break</TableHead>
                                            <TableHead>Tasks Today</TableHead>
                                            <TableHead>Leave</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((row: any) => {
                                            const statusColor = {
                                                present: 'text-green-500',
                                                completed: 'text-blue-500',
                                                on_leave: 'text-yellow-500',
                                                absent: 'text-red-500',
                                            }[row.status] ?? 'text-muted-foreground';
                                            const breakText = row.lastBreak
                                                ? `${new Date(row.lastBreak.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → ${row.lastBreak.endedAt ? new Date(row.lastBreak.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'running'} (${row.lastBreak.status})`
                                                : '-';
                                            return (
                                                <TableRow key={row.employeeId}>
                                                    <TableCell className="font-medium">{row.name}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{row.department} / {row.designation}</TableCell>
                                                    <TableCell className={`font-semibold capitalize ${statusColor}`}>{row.status.replace('_', ' ')}</TableCell>
                                                    <TableCell>{row.entryTime}</TableCell>
                                                    <TableCell>{row.exitTime}</TableCell>
                                                    <TableCell className="font-medium">{row.totalHours}</TableCell>
                                                    <TableCell className="text-xs">{breakText}</TableCell>
                                                    <TableCell className="text-xs">{row.tasksToday?.length > 0 ? row.tasksToday.map((t: any) => t.name).join(', ') : '-'}</TableCell>
                                                    <TableCell className="text-xs">{row.leaveToday?.length > 0 ? row.leaveToday.map((l: any) => l.type).join(', ') : '-'}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </>
                            )}
                            
                            {reportType === 'weekly' && (
                                <>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Dept</TableHead>
                                            <TableHead>Mon</TableHead>
                                            <TableHead>Tue</TableHead>
                                            <TableHead>Wed</TableHead>
                                            <TableHead>Thu</TableHead>
                                            <TableHead>Fri</TableHead>
                                            <TableHead>Sat</TableHead>
                                            <TableHead>Sun</TableHead>
                                            <TableHead className="bg-yellow-500/10 font-bold">Total</TableHead>
                                            <TableHead>Leave</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((row: any) => (
                                            <TableRow key={row.employeeId}>
                                                <TableCell className="font-medium">{row.name}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{row.department}</TableCell>
                                                <TableCell className="text-green-500">{row.days?.mon?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="text-green-500">{row.days?.tue?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="text-green-500">{row.days?.wed?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="text-green-500">{row.days?.thu?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="text-green-500">{row.days?.fri?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="text-muted-foreground">{row.days?.sat?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="text-muted-foreground">{row.days?.sun?.formatted ?? '00:00:00'}</TableCell>
                                                <TableCell className="bg-yellow-500/10 font-bold">{row.totalHours}</TableCell>
                                                <TableCell className="text-xs">{row.leaves?.length > 0 ? row.leaves.map((l: any) => `${l.type} (${l.totalDays}d)`).join(', ') : '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </>
                            )}

                            {reportType === 'monthly' && (
                                <>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Dept / Designation</TableHead>
                                            <TableHead>Work Days (Month)</TableHead>
                                            <TableHead>Days Worked</TableHead>
                                            <TableHead>Leave Days</TableHead>
                                            <TableHead>Absent Days</TableHead>
                                            <TableHead>Total Hours</TableHead>
                                            <TableHead>Leave Breakdown</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((row: any) => (
                                            <TableRow key={row.employeeId}>
                                                <TableCell className="font-medium">{row.name}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{row.department} / {row.designation}</TableCell>
                                                <TableCell>{row.totalWorkDaysInMonth}</TableCell>
                                                <TableCell className="text-green-600 font-medium">{row.workedDays}</TableCell>
                                                <TableCell className="text-yellow-600">{row.totalLeaveDays}</TableCell>
                                                <TableCell className="text-red-600">{row.absentDays}</TableCell>
                                                <TableCell className="font-medium">{row.totalHours}</TableCell>
                                                <TableCell className="text-xs">
                                                    {row.leaveBreakdown?.length > 0
                                                        ? row.leaveBreakdown.map((l: any) => `${l.type} (${l.days}d${l.isPaid ? '' : ' unpaid'})`).join(', ')
                                                        : '-'
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </>
                            )}
                            
                            {reportData.length === 0 && !isLoading && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={reportType === 'daily' ? 9 : reportType === 'weekly' ? 11 : 8} className="h-24 text-center text-muted-foreground">
                                            No attendance data found for this period.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};
