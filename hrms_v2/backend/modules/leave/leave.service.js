import {
    getEmployeeById,
    getLeavePolicy,
    getLeaveSettings,
    getLeaveTypeById,
    getCompanySettings,
    getPendingLeaveRequests,
    getLeaveRequestForApproval,
    approveOrRejectLeaveTransaction,
    cancelLeaveTransaction,
    applyLeaveTransaction,
    getEmployeeLeaveBalances,
    getLeaveBalance,
    updateEmployeeLeaveBalance
} from "./leave.repository.js";
import { getHolidaysByDateRange } from "../holiday/holiday.repository.js";
import { applyLeaveSchema, leaveApprovalSchema, cancelLeaveSchema, updateLeaveBalanceSchema } from "./leave.validation.js";
import { getLeaveListPolicy, canApproveLeave, canRejectLeave, canCancelLeave, getLeaveBalancePolicy, getUpdateLeaveBalancePolicy, canUpdateLeaveBalance } from "./leave.policy.js";

const DAY_MS = 24 * 60 * 60 * 1000;

class LeaveValidationError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const dateOnly = (value) => {
    const date = new Date(value);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const dateKey = (date) => date.toISOString().slice(0, 10);

const daysBetween = (start, end) => Math.round((end - start) / DAY_MS) + 1;

const leaveYearFor = (date, startMonth) => {
    const year = date.getUTCFullYear();
    return date.getUTCMonth() + 1 >= startMonth ? year : year - 1;
};

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const weekdayName = (date) => [
    "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
][date.getUTCDay()];

const isHoliday = (date, holidays) => holidays.has(dateKey(date));

const isNonWorkingDay = (date, weeklyOffDays, holidays) =>
    weeklyOffDays.has(weekdayName(date)) || isHoliday(date, holidays);

const calculateLeaveDays = ({ startDate, endDate, isHalfDay, settings, companySettings, holidays }) => {
    const weeklyOffDays = new Set((companySettings.weeklyOffDays || []).map((day) => day.toUpperCase()));
    const holidayDates = new Set(holidays.map((holiday) => dateKey(dateOnly(holiday.date))));
    const totalCalendarDays = daysBetween(startDate, endDate);
    let totalDays = 0;

    for (let index = 0; index < totalCalendarDays; index += 1) {
        const current = addDays(startDate, index);
        if (!isNonWorkingDay(current, weeklyOffDays, holidayDates)) totalDays += 1;
    }

    if (settings.sandwichLeaveEnabled && totalDays > 0) {
        let index = 0;
        while (index < totalCalendarDays) {
            const current = addDays(startDate, index);
            if (!isNonWorkingDay(current, weeklyOffDays, holidayDates)) {
                index += 1;
                continue;
            }

            const blockStart = index;
            while (
                index < totalCalendarDays &&
                isNonWorkingDay(addDays(startDate, index), weeklyOffDays, holidayDates)
            ) index += 1;
            const blockEnd = index - 1;
            const surroundedByLeaveDays = blockStart > 0 && blockEnd < totalCalendarDays - 1;

            if (surroundedByLeaveDays) {
                for (let blockIndex = blockStart; blockIndex <= blockEnd; blockIndex += 1) {
                    const blockDate = addDays(startDate, blockIndex);
                    const isWeekend = weeklyOffDays.has(weekdayName(blockDate));
                    const isHolidayDay = isHoliday(blockDate, holidayDates);
                    if ((isWeekend && settings.countWeekendInSandwich) || (isHolidayDay && settings.countHolidayInSandwich)) {
                        totalDays += 1;
                    }
                }
            }
        }
    }

    if (isHalfDay) {
        if (startDate.getTime() !== endDate.getTime()) {
            throw new LeaveValidationError("Half-day leave must be for one date.");
        }
        if (totalDays === 0) {
            throw new LeaveValidationError("Leave cannot be applied on a weekly off or holiday.");
        }
        return 0.5;
    }

    if (totalDays === 0) {
        throw new LeaveValidationError("Selected dates contain no working days.");
    }
    return totalDays;
};

const validateDateRules = ({ startDate, endDate, settings, leavePolicy, employee }) => {
    const today = dateOnly(new Date());

    if (endDate < startDate) throw new LeaveValidationError("End date cannot be before start date.");
    if (employee.employmentStatus === "PROBATION" && !leavePolicy.probationEligible) {
        throw new LeaveValidationError("Employees on probation cannot apply for this leave.");
    }
    if (settings.defaultMaxConsecutiveDays && daysBetween(startDate, endDate) > settings.defaultMaxConsecutiveDays) {
        throw new LeaveValidationError(`Leave cannot exceed ${settings.defaultMaxConsecutiveDays} consecutive days.`);
    }

    const daysFromToday = Math.round((startDate - today) / DAY_MS);
    if (daysFromToday < 0) {
        if (!settings.allowBackdatedLeave) throw new LeaveValidationError("Backdated leave is not allowed.");
        if (settings.backdatedLimitDays != null && Math.abs(daysFromToday) > settings.backdatedLimitDays) {
            throw new LeaveValidationError(`Backdated leave is limited to ${settings.backdatedLimitDays} days.`);
        }
    }
    if (daysFromToday > 0) {
        if (!settings.allowFutureLeave) throw new LeaveValidationError("Future leave is not allowed.");
        if (settings.futureLimitDays != null && daysFromToday > settings.futureLimitDays) {
            throw new LeaveValidationError(`Future leave can only be applied ${settings.futureLimitDays} days in advance.`);
        }
    }
    if (settings.defaultMinNoticeDays != null && daysFromToday >= 0 && daysFromToday < settings.defaultMinNoticeDays) {
        throw new LeaveValidationError(`Leave requires at least ${settings.defaultMinNoticeDays} days' notice.`);
    }
};

export const applyLeaveService = async (employeeId, reqBody) => {
    const parsed = applyLeaveSchema.safeParse(reqBody);
    if (!parsed.success) {
        return { success: false, status: 400, message: "Invalid leave data", error: parsed.error.issues[0].message };
    }
    if (!employeeId) return { success: false, status: 401, message: "Employee account is required." };

    try {
        const data = parsed.data;
        const [employee, leaveType, leaveSettings, companySettings] = await Promise.all([
            getEmployeeById(employeeId),
            getLeaveTypeById(data.leaveTypeId),
            getLeaveSettings(),
            getCompanySettings()
        ]);

        if (!employee) throw new LeaveValidationError("Employee not found.", 404);
        if (!leaveType?.isActive) throw new LeaveValidationError("Leave type not found or inactive.", 404);
        if (!leaveSettings) throw new LeaveValidationError("Leave settings are not configured.", 500);
        if (!companySettings) throw new LeaveValidationError("Company settings are not configured.", 500);

        const startDate = dateOnly(data.startDate);
        const endDate = dateOnly(data.endDate);
        const leavePolicy = await getLeavePolicy(data.leaveTypeId, employee.employeeType);
        if (!leavePolicy) throw new LeaveValidationError("Leave policy not found for this employee.", 404);
        if (data.isHalfDay && !leavePolicy.halfDayAllowed) {
            throw new LeaveValidationError("Half-day leave is not allowed for this leave type.");
        }

        validateDateRules({ startDate, endDate, settings: leaveSettings, leavePolicy, employee });
        const leaveYear = leaveYearFor(startDate, leaveSettings.leaveYearStartMonth);
        if (leaveYearFor(endDate, leaveSettings.leaveYearStartMonth) !== leaveYear) {
            throw new LeaveValidationError("A leave request cannot cross two leave years.");
        }

        const holidays = await getHolidaysByDateRange(startDate, endDate);
        const totalDays = calculateLeaveDays({
            startDate, endDate, isHalfDay: data.isHalfDay,
            settings: leaveSettings, companySettings, holidays
        });

        const status = leavePolicy.requiresApproval ? "PENDING" : "APPROVED";
        const result = await applyLeaveTransaction({
            employeeId,
            leaveTypeId: data.leaveTypeId,
            startDate,
            endDate,
            totalDays,
            reason: data.reason,
            isHalfDay: data.isHalfDay,
            actionById: employeeId,
            leaveYear,
            status
        });

        return { success: true, status: 201, message: "Leave request created successfully.", data: result };
    } catch (error) {
        if (error instanceof LeaveValidationError) {
            return { success: false, status: error.status, message: error.message };
        }
        throw error;
    }
};

export const getPendingLeaveRequestsService = async (scope, reqUser) => {
    const scopedWhere = await getLeaveListPolicy({ status: "PENDING" }, scope, reqUser);
    return {
        success: true,
        status: 200,
        message: "Pending leave requests fetched successfully.",
        data: await getPendingLeaveRequests(scopedWhere)
    };
};

export const approveOrRejectLeaveService = async (leaveRequestId, actionById, scope, action, reqBody) => {
    const parsed = leaveApprovalSchema.safeParse(reqBody || {});
    if (!parsed.success) {
        return { success: false, status: 400, message: "Invalid approval data.", error: parsed.error.issues[0].message };
    }
    if (!actionById) return { success: false, status: 401, message: "Approver employee account is required." };

    try {
        const [approver, settings] = await Promise.all([getEmployeeById(actionById), getLeaveSettings()]);
        if (!approver) throw new LeaveValidationError("Approver employee not found.", 404);
        if (!settings) throw new LeaveValidationError("Leave settings are not configured.", 500);

        const request = await getLeaveRequestForApproval(leaveRequestId);
        if (!request) throw new LeaveValidationError("Leave request not found.", 404);

        const policyResult = action === "APPROVED"
            ? await canApproveLeave(request, scope, { employeeId: actionById })
            : await canRejectLeave(request, scope, { employeeId: actionById });
        if (!policyResult.allowed) {
            throw new LeaveValidationError(policyResult.message, policyResult.status);
        }

        const result = await approveOrRejectLeaveTransaction({
            leaveRequestId,
            actionById,
            action,
            comment: parsed.data.comment,
            year: leaveYearFor(dateOnly(request.startDate), settings.leaveYearStartMonth)
        });
        return {
            success: true,
            status: 200,
            message: action === "APPROVED" ? "Leave approved successfully." : "Leave rejected successfully.",
            data: result
        };
    } catch (error) {
        if (error instanceof LeaveValidationError) return { success: false, status: error.status, message: error.message };
        if (error.code === "LEAVE_NOT_FOUND") return { success: false, status: 404, message: error.message };
        if (error.code === "LEAVE_NOT_PENDING") return { success: false, status: 409, message: error.message };
        if (error.code === "BALANCE_NOT_FOUND") return { success: false, status: 404, message: error.message };
        if (error.code === "BALANCE_INCONSISTENT") return { success: false, status: 409, message: error.message };
        throw error;
    }
};


export const cancLeaveService = async (leaveRequestId, actionById, scope, action, reqBody) => {
    if (!actionById) return { success: false, status: 401, message: "Employee account is required." };

    const parsed = cancelLeaveSchema.safeParse(reqBody || {});
    if (!parsed.success) {
        return { success: false, status: 400, message: "Invalid cancellation data.", error: parsed.error.issues[0].message };
    }

    try {
        const [settings, request] = await Promise.all([
            getLeaveSettings(),
            getLeaveRequestForApproval(leaveRequestId)
        ]);

        if (!settings) throw new LeaveValidationError("Leave settings are not configured.", 500);
        if (!request) throw new LeaveValidationError("Leave request not found.", 404);
        if (request.status === "CANCELLED" || request.status === "REJECTED") {
            throw new LeaveValidationError("Only pending or approved leave requests can be cancelled.", 409);
        }

        const policyResult = await canCancelLeave(request, scope, { employeeId: actionById });
        if (!policyResult.allowed) {
            throw new LeaveValidationError(policyResult.message, policyResult.status);
        }

        const result = await cancelLeaveTransaction({
            leaveRequestId,
            actionById,
            comment: parsed.data.comment,
            year: leaveYearFor(dateOnly(request.startDate), settings.leaveYearStartMonth)
        });

        return {
            success: true,
            status: 200,
            message: "Leave cancelled successfully.",
            data: result
        };
    } catch (error) {
        if (error instanceof LeaveValidationError) return { success: false, status: error.status, message: error.message };
        if (error.code === "LEAVE_NOT_FOUND") return { success: false, status: 404, message: error.message };
        if (error.code === "LEAVE_NOT_CANCELLABLE") return { success: false, status: 409, message: error.message };
        if (error.code === "BALANCE_NOT_FOUND") return { success: false, status: 404, message: error.message };
        throw error;
    }
};


export const getLeaveBalanceService = async (employeeId, actionById, scope) => {
    // 1. validate calling user and target employee id
    // 2. fetch target employee for scope checks
    // 3. authorize by scope using policy layer
    // 4. fetch balance records and return them
    if (!actionById) return { success: false, status: 401, message: "Employee account is required." };
    if (!employeeId) return { success: false, status: 400, message: "Target employee id is required." };

    try {
        const targetEmployee = await getEmployeeById(employeeId);
        if (!targetEmployee) throw new LeaveValidationError("Employee not found.", 404);

        const where = await getLeaveBalancePolicy({ employeeId }, scope, { employeeId: actionById });
        const balances = await getEmployeeLeaveBalances(where);
        return {
            success: true,
            status: 200,
            message: "Leave balance fetched successfully.",
            data: balances
        };
    } catch (error) {
        if (error instanceof LeaveValidationError) return { success: false, status: error.status, message: error.message };
        throw error;
    }
};

export const updateEmployeeLeaveBalanceService = async (employeeId, actionById, scope, reqBody) => {
    // 1. validate calling user and target employee id
    // 2. validate request body fields
    // 3. fetch target employee and existing balance record
    // 4. authorize by scope using policy layer
    // 5. apply partial balance updates
    const parsed = updateLeaveBalanceSchema.safeParse(reqBody || {});
    if (!parsed.success) {
        return { success: false, status: 400, message: "Invalid balance update data.", error: parsed.error.issues[0].message };
    }
    if (!actionById) return { success: false, status: 401, message: "Employee account is required." };
    if (!employeeId) return { success: false, status: 400, message: "Target employee id is required." };

    try {
        const data = parsed.data;
        const targetEmployee = await getEmployeeById(employeeId);
        if (!targetEmployee) throw new LeaveValidationError("Employee not found.", 404);

        const policyResult = await canUpdateLeaveBalance(targetEmployee, scope, { employeeId: actionById });
        if (!policyResult.allowed) {
            throw new LeaveValidationError(policyResult.message, policyResult.status);
        }

        const filteredWhere = await getUpdateLeaveBalancePolicy(
            { employeeId, leaveTypeId: data.leaveTypeId, year: data.year },
            scope,
            { employeeId: actionById }
        );
        const existingBalance = await getLeaveBalance(filteredWhere);
        if (!existingBalance) throw new LeaveValidationError("Leave balance not found for this leave year.", 404);

        const updateData = {};
        if (data.allocated !== undefined) updateData.allocated = data.allocated;
        if (data.carriedForward !== undefined) updateData.carriedForward = data.carriedForward;
        if (data.used !== undefined) updateData.used = data.used;
        if (data.pending !== undefined) updateData.pending = data.pending;

        if (!Object.keys(updateData).length) {
            return { success: false, status: 400, message: "No balance fields provided to update." };
        }

        const updatedBalance = await updateEmployeeLeaveBalance({
            employeeId,
            leaveTypeId: data.leaveTypeId,
            year: data.year,
            data: updateData
        });

        return {
            success: true,
            status: 200,
            message: "Leave balance updated successfully.",
            data: updatedBalance
        };
    } catch (error) {
        if (error instanceof LeaveValidationError) return { success: false, status: error.status, message: error.message };
        throw error;
    }
};


export { calculateLeaveDays, leaveYearFor };
