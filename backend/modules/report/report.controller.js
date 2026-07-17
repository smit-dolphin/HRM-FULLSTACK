import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import prisma from "../../config/prisma.config.js"

// ─── Date Helpers ───────────────────────────────────────────────────────────

const startOf = (d) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; }
const endOf   = (d) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; }

const getStartOfWeek = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = d.getDay() === 0 ? 7 : d.getDay(); // Mon=1 … Sun=7
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
}
const getEndOfWeek = (dateStr) => {
    const s = getStartOfWeek(dateStr);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return e;
}
const getStartOfMonth = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
const getEndOfMonth = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

// ─── Time Calculation (same logic as tasksessions.controller.js) ─────────────
/**
 * Given a list of sessions (each with .break[] array, startTime, endTime?,
 * taskSessionStatus), calculate the total actual working seconds
 * excluding break time, using the exact same algorithm as
 * calculateTotalTimeOfAllCurrentActiveTaskSessions.
 */
const calcWorkSeconds = (sessions) => {
    let totalSeconds = 0;
    let totalBreakSeconds = 0;

    for (const session of sessions) {
        if (session.taskSessionStatus === "completed" && session.endTime) {
            // completed → use endTime - startTime
            const diff = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
            totalSeconds += diff;
            for (const brk of session.break) {
                if (brk.endedAt) {
                    totalBreakSeconds += Math.floor((new Date(brk.endedAt) - new Date(brk.startedAt)) / 1000);
                }
            }
        } else if (session.taskSessionStatus === "paused") {
            // paused → elapsed up to when break started
            let breakStartedAt = new Date();
            for (const brk of session.break) {
                if (brk.endedAt) {
                    totalBreakSeconds += Math.floor((new Date(brk.endedAt) - new Date(brk.startedAt)) / 1000);
                } else {
                    breakStartedAt = new Date(brk.startedAt);
                }
            }
            totalSeconds += Math.floor((breakStartedAt - new Date(session.startTime)) / 1000);
        } else if (session.taskSessionStatus === "running") {
            // running → elapsed up to now
            totalSeconds += Math.floor((new Date() - new Date(session.startTime)) / 1000);
            for (const brk of session.break) {
                if (brk.endedAt) {
                    totalBreakSeconds += Math.floor((new Date(brk.endedAt) - new Date(brk.startedAt)) / 1000);
                }
            }
        }
    }

    return Math.max(0, totalSeconds - totalBreakSeconds);
}

const formatSeconds = (s) => {
    if (!s || s <= 0) return "00:00:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Count Mon-Fri days between start and end (inclusive)
const countWeekdays = (startDate, endDate) => {
    let count = 0;
    const cur = new Date(startDate);
    cur.setHours(12, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(12, 0, 0, 0);
    while (cur <= end) {
        const d = cur.getDay();
        if (d !== 0 && d !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

// ─── Base employee fetcher ────────────────────────────────────────────────────
const fetchEmployeesWithSessions = async (start, end, employeeId = null) => {
    const where = employeeId ? { id: employeeId } : {};
    return prisma.employee.findMany({
        where,
        include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { name: true } },
            designation: { select: { name: true } },
            sessions: {
                where: { startTime: { gte: start, lte: end } },
                include: { break: true, task: { select: { id: true, name: true, status: true } } },
                orderBy: { startTime: "asc" }
            },
            leaveRequests: {
                where: {
                    startDate: { lte: end },
                    endDate:   { gte: start },
                    status: "approved"
                },
                include: { leaveType: { select: { name: true, isPaid: true } } }
            }
        }
    });
}

// ─── Daily Report Calculator ─────────────────────────────────────────────────
const calculateDailyAttendance = async (dateParam, employeeId = null) => {
    const start = startOf(dateParam ? new Date(dateParam) : new Date());
    const end   = endOf(dateParam   ? new Date(dateParam) : new Date());

    const employees = await fetchEmployeesWithSessions(start, end, employeeId);

    return employees.map(emp => {
        const sessions = emp.sessions;

        // Entry = earliest session start; Exit = latest session endTime (or now if running)
        let entryTime  = null;
        let exitTime   = null;
        let lastSession = null;
        let lastBreakInfo = null;
        let sessionStatus = "absent";

        if (sessions.length > 0) {
            entryTime  = sessions[0].startTime; // already ordered asc
            // latest session
            lastSession = sessions[sessions.length - 1];
            sessionStatus = lastSession.taskSessionStatus;

            // determine exit: if completed/paused use endTime, else still running
            const completedSessions = sessions.filter(s => s.endTime);
            if (completedSessions.length > 0) {
                exitTime = completedSessions.reduce((a, b) =>
                    new Date(a.endTime) > new Date(b.endTime) ? a : b
                ).endTime;
            }

            // last break info across all sessions
            const allBreaks = sessions.flatMap(s => s.break);
            if (allBreaks.length > 0) {
                const latest = allBreaks.reduce((a, b) =>
                    new Date(a.startedAt) > new Date(b.startedAt) ? a : b
                );
                lastBreakInfo = {
                    startedAt: latest.startedAt,
                    endedAt: latest.endedAt || null,
                    status: latest.endedAt ? "completed" : "running"
                };
            }
        }

        const workedSeconds = calcWorkSeconds(sessions);

        // Tasks worked on today
        const tasksToday = [...new Map(sessions.map(s => [s.task.id, {
            id: s.task.id,
            name: s.task.name,
            status: s.taskSessionStatus
        }])).values()];

        // Leave info
        const leaveToday = emp.leaveRequests.length > 0 ? emp.leaveRequests.map(l => ({
            type: l.leaveType.name,
            isPaid: l.leaveType.isPaid,
            totalDays: l.totalDays
        })) : [];

        return {
            employeeId: emp.id,
            name: emp.user.name,
            email: emp.user.email,
            department: emp.department?.name ?? "-",
            designation: emp.designation?.name ?? "-",
            status: sessions.length === 0
                ? (leaveToday.length > 0 ? "on_leave" : "absent")
                : sessionStatus === "completed" ? "completed" : "present",
            entryTime: entryTime ? new Date(entryTime).toLocaleTimeString("en-PK", { hour12: false }) : "-",
            exitTime:  exitTime  ? new Date(exitTime).toLocaleTimeString("en-PK",  { hour12: false }) : "-",
            workedSeconds,
            totalHours: formatSeconds(workedSeconds),
            lastBreak: lastBreakInfo,
            tasksToday,
            leaveToday
        };
    });
}

// ─── Weekly Report Calculator ─────────────────────────────────────────────────
const calculateWeeklyAttendance = async (dateParam, employeeId = null) => {
    const start = getStartOfWeek(dateParam);
    const end   = getEndOfWeek(dateParam);

    const employees = await fetchEmployeesWithSessions(start, end, employeeId);

    // Day labels: 0=Mon…6=Sun (JS: 0=Sun, 1=Mon…6=Sat)
    const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

    return employees.map(emp => {
        // group sessions by weekday
        const daySeconds = [0, 0, 0, 0, 0, 0, 0]; // mon…sun

        for (const session of emp.sessions) {
            const jsDay = new Date(session.startTime).getDay(); // 0=Sun…6=Sat
            const idx = jsDay === 0 ? 6 : jsDay - 1;           // 0=Mon…6=Sun
            daySeconds[idx] += calcWorkSeconds([session]);
        }

        const weeklyTotalSeconds = daySeconds.reduce((a, b) => a + b, 0);

        const dayData = {};
        dayKeys.forEach((key, i) => {
            dayData[key] = {
                seconds: daySeconds[i],
                formatted: formatSeconds(daySeconds[i])
            };
        });

        // leaves this week
        const leaves = emp.leaveRequests.map(l => ({
            type: l.leaveType.name,
            totalDays: l.totalDays
        }));

        return {
            employeeId: emp.id,
            name: emp.user.name,
            email: emp.user.email,
            department: emp.department?.name ?? "-",
            designation: emp.designation?.name ?? "-",
            days: dayData,
            weeklyTotalSeconds,
            totalHours: formatSeconds(weeklyTotalSeconds),
            leaves
        };
    });
}

// ─── Monthly Report Calculator ────────────────────────────────────────────────
const calculateMonthlyAttendance = async (dateParam, employeeId = null) => {
    const start = getStartOfMonth(dateParam);
    const end   = getEndOfMonth(dateParam);

    const totalWorkDaysInMonth = countWeekdays(start, end);
    const employees = await fetchEmployeesWithSessions(start, end, employeeId);

    return employees.map(emp => {
        // Unique days (Mon-Fri only) where employee had sessions
        const workedDaysSet = new Set();
        let totalWorkedSeconds = 0;

        for (const session of emp.sessions) {
            const d = new Date(session.startTime);
            const jsDay = d.getDay();
            if (jsDay !== 0 && jsDay !== 6) {
                workedDaysSet.add(d.toISOString().split("T")[0]);
            }
            totalWorkedSeconds += calcWorkSeconds([session]);
        }
        const workedDays = workedDaysSet.size;

        // Leave summary
        let totalLeaveDays = 0;
        const leaveBreakdown = [];
        for (const leave of emp.leaveRequests) {
            totalLeaveDays += leave.totalDays ?? 0;
            leaveBreakdown.push({
                type: leave.leaveType.name,
                isPaid: leave.leaveType.isPaid,
                days: leave.totalDays
            });
        }

        const absentDays = Math.max(0, totalWorkDaysInMonth - workedDays - totalLeaveDays);

        return {
            employeeId: emp.id,
            name: emp.user.name,
            email: emp.user.email,
            department: emp.department?.name ?? "-",
            designation: emp.designation?.name ?? "-",
            totalWorkDaysInMonth,   // total Mon-Fri days in the month
            workedDays,             // days employee actually had sessions
            totalLeaveDays,         // approved leave days
            absentDays,             // remaining missing days
            totalWorkedSeconds,
            totalHours: formatSeconds(totalWorkedSeconds),
            leaveBreakdown
        };
    });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const getAttendanceReport = async (req, res) => {
    try {
        const { type = "daily", date } = req.query;

        let data = [], dateRange = {};

        if (type === "daily") {
            data = await calculateDailyAttendance(date);
            const s = startOf(date ? new Date(date) : new Date());
            dateRange = { start: s, end: endOf(s) };
        } else if (type === "weekly") {
            data = await calculateWeeklyAttendance(date);
            dateRange = { start: getStartOfWeek(date), end: getEndOfWeek(date) };
        } else if (type === "monthly") {
            data = await calculateMonthlyAttendance(date);
            dateRange = { start: getStartOfMonth(date), end: getEndOfMonth(date) };
        } else {
            return errorResponse(res, 400, "Invalid report type", "Type must be daily, weekly, or monthly");
        }

        return successResponse(res, 200, `${type} attendance report`, { type, dateRange, count: data.length, data });
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export const getOwnAttendanceReport = async (req, res) => {
    try {
        const { type = "daily", date } = req.query;
        const userId = req.user.id;

        // Resolve user → employee
        const employee = await prisma.employee.findUnique({ where: { userId } });
        if (!employee) return errorResponse(res, 404, "Employee profile not found");

        let data = [], dateRange = {};

        if (type === "daily") {
            data = await calculateDailyAttendance(date, employee.id);
            const s = startOf(date ? new Date(date) : new Date());
            dateRange = { start: s, end: endOf(s) };
        } else if (type === "weekly") {
            data = await calculateWeeklyAttendance(date, employee.id);
            dateRange = { start: getStartOfWeek(date), end: getEndOfWeek(date) };
        } else if (type === "monthly") {
            data = await calculateMonthlyAttendance(date, employee.id);
            dateRange = { start: getStartOfMonth(date), end: getEndOfMonth(date) };
        } else {
            return errorResponse(res, 400, "Invalid report type", "Type must be daily, weekly, or monthly");
        }

        return successResponse(res, 200, `Your ${type} attendance report`, { type, dateRange, data: data[0] ?? null });
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export const getWorkReport = async (req, res) => {
    try {
        const userId = req.user.id;

        // ── resolve employee ─────────────────────────────────────────────────
        const employee = await prisma.employee.findUnique({ where: { userId } });
        if (!employee) return errorResponse(res, 404, "Employee profile not found");

        // ── date-range filter (startDate / endDate query params, default: today) ─
        const rawStart = req.query.startDate ? new Date(req.query.startDate) : new Date();
        const rawEnd   = req.query.endDate   ? new Date(req.query.endDate)   : new Date();
        const rangeStart = startOf(rawStart);
        const rangeEnd   = endOf(rawEnd);

        // ── fetch all sessions in range with task, project, and breaks ────────
        const sessions = await prisma.taskSessionTimer.findMany({
            where: {
                employeeId: employee.id,
                startTime: { gte: rangeStart, lte: rangeEnd }
            },
            include: {
                task: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        priority: true,
                        project: { select: { id: true, name: true } }
                    }
                },
                break: { orderBy: { startedAt: "asc" } }
            },
            orderBy: { startTime: "asc" }
        });

        // ── group sessions by calendar date ───────────────────────────────────
        const byDate = {};    // { "2026-07-17": { sessions: [], totalSeconds: 0 } }

        for (const session of sessions) {
            const dateKey = new Date(session.startTime).toISOString().split("T")[0];
            if (!byDate[dateKey]) byDate[dateKey] = { sessions: [], totalSeconds: 0 };
            byDate[dateKey].sessions.push(session);
        }

        // ── build response shape ──────────────────────────────────────────────
        const days = Object.entries(byDate)
            .sort(([a], [b]) => b.localeCompare(a)) // newest first
            .map(([date, { sessions: daySessions }]) => {

                // group day-sessions by task
                const taskMap = {};
                for (const s of daySessions) {
                    const tid = s.task.id;
                    if (!taskMap[tid]) {
                        taskMap[tid] = {
                            taskId:    tid,
                            taskName:  s.task.name,
                            taskStatus: s.task.status,
                            priority:  s.task.priority,
                            project:   s.task.project,
                            sessions:  [],
                            taskTotalSeconds: 0
                        };
                    }
                    taskMap[tid].sessions.push(s);
                }

                // build task entries
                const tasks = Object.values(taskMap).map(taskEntry => {
                    const sessionSegments = taskEntry.sessions.map(s => {
                        // ── net worked seconds for this one session ──────────
                        const netSeconds = calcWorkSeconds([s]);

                        // determine From / To display
                        const from = new Date(s.startTime).toLocaleTimeString("en-PK", { hour12: false });

                        let to = "-";
                        if (s.endTime) {
                            to = new Date(s.endTime).toLocaleTimeString("en-PK", { hour12: false });
                        } else if (s.taskSessionStatus === "paused") {
                            // ended at the break start
                            const openBreak = s.break.find(b => !b.endedAt);
                            if (openBreak) to = new Date(openBreak.startedAt).toLocaleTimeString("en-PK", { hour12: false });
                        } else if (s.taskSessionStatus === "running") {
                            to = "Active";
                        }

                        // ── break segments ────────────────────────────────────
                        const breaks = s.break.map(brk => {
                            const bStart = new Date(brk.startedAt);
                            const bEnd   = brk.endedAt ? new Date(brk.endedAt) : null;
                            const bSecs  = bEnd
                                ? Math.floor((bEnd - bStart) / 1000)
                                : null;
                            return {
                                id:        brk.id,
                                from:      bStart.toLocaleTimeString("en-PK", { hour12: false }),
                                to:        bEnd ? bEnd.toLocaleTimeString("en-PK", { hour12: false }) : "Active",
                                total:     bSecs !== null ? formatSeconds(bSecs) : "Active",
                                totalSecs: bSecs
                            };
                        });

                        return {
                            sessionId:  s.id,
                            status:     s.taskSessionStatus,
                            from,
                            to,
                            netSeconds,
                            total:      formatSeconds(netSeconds),
                            breaks
                        };
                    });

                    // task total = sum of all session net seconds
                    taskEntry.taskTotalSeconds = sessionSegments.reduce((acc, s) => acc + s.netSeconds, 0);

                    return {
                        taskId:           taskEntry.taskId,
                        taskName:         taskEntry.taskName,
                        taskStatus:       taskEntry.taskStatus,
                        priority:         taskEntry.priority,
                        project:          taskEntry.project,
                        taskTotalSeconds: taskEntry.taskTotalSeconds,
                        taskTotal:        formatSeconds(taskEntry.taskTotalSeconds),
                        sessions:         sessionSegments
                    };
                });

                const dayTotalSeconds = tasks.reduce((acc, t) => acc + t.taskTotalSeconds, 0);

                return {
                    date,
                    dayTotalSeconds,
                    dayTotal: formatSeconds(dayTotalSeconds),
                    tasks
                };
            });

        return successResponse(res, 200, "Work report fetched successfully", {
            employeeId: employee.id,
            dateRange:  { start: rangeStart, end: rangeEnd },
            totalDays:  days.length,
            grandTotalSeconds: days.reduce((acc, d) => acc + d.dayTotalSeconds, 0),
            grandTotal: formatSeconds(days.reduce((acc, d) => acc + d.dayTotalSeconds, 0)),
            days
        });
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

