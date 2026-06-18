export const rolePermissions = {
  superadmin: [
    'user:view', 'user:create', 'user:edit', 'user:delete',
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:block',
    'department:view', 'department:create', 'department:edit', 'department:delete',
    'designation:view', 'designation:create', 'designation:edit', 'designation:delete',
    'leave:view', 'leave:create', 'leave:approve', 'leave:delete',
    'leave:type:manage',
    'leave:balance:view', 'leave:balance:edit',
    'holiday:manage',
  ],
  admin: [
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:block',
    'user:view',
    'leave:view', 'leave:create', 'leave:approve', 'leave:delete',
    'leave:type:manage',
    'leave:balance:view', 'leave:balance:edit',
    'department:view', 'designation:view',
    'holiday:manage',
  ],
  manager: [
    'employee:view',
    'leave:view', 'leave:create', 'leave:approve',
    'leave:balance:view',
  ],
  teamleader: [
    'leave:view', 'leave:create',
  ],
  employee: [
    'leave:view', 'leave:create',
  ],
}

/**
 * All available permissions in the system grouped by module.
 * Send this to frontend so it knows what permissions exist.
 *
 * GET /api/auth/permissions → returns this object
 */
export const availablePermissions = {
  User: [
    { key: 'user:view',   label: 'View Users' },
    { key: 'user:create', label: 'Create Users' },
    { key: 'user:edit',   label: 'Edit Users' },
    { key: 'user:delete', label: 'Delete Users' },
  ],
  Employee: [
    { key: 'employee:view',   label: 'View Employees' },
    { key: 'employee:create', label: 'Create Employees' },
    { key: 'employee:edit',   label: 'Edit Employees' },
    { key: 'employee:delete', label: 'Delete Employees' },
    { key: 'employee:block',  label: 'Block/Unblock Employees' },
  ],
  Department: [
    { key: 'department:view',   label: 'View Departments' },
    { key: 'department:create', label: 'Create Departments' },
    { key: 'department:edit',   label: 'Edit Departments' },
    { key: 'department:delete', label: 'Delete Departments' },
  ],
  Designation: [
    { key: 'designation:view',   label: 'View Designations' },
    { key: 'designation:create', label: 'Create Designations' },
    { key: 'designation:edit',   label: 'Edit Designations' },
    { key: 'designation:delete', label: 'Delete Designations' },
  ],
  Leave: [
    { key: 'leave:view',    label: 'View Leaves' },
    { key: 'leave:create',  label: 'Create Leave Requests' },
    { key: 'leave:approve', label: 'Approve/Reject Leaves' },
    { key: 'leave:delete',  label: 'Delete Leaves' },
  ],
  LeaveType: [
    { key: 'leave:type:manage', label: 'Manage Leave Types' },
  ],
  LeaveBalance: [
    { key: 'leave:balance:view', label: 'View Leave Balances' },
    { key: 'leave:balance:edit', label: 'Edit Leave Balances' },
  ],
  Holiday: [
    { key: 'holiday:manage', label: 'Manage Holidays' },
  ],
}
