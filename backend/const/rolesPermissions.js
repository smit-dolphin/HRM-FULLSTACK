export const rolePermissions = {
  superadmin: [
    'user:view', 'user:create', 'user:edit', 'user:delete',
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:block',
    'department:view', 'department:create', 'department:edit', 'department:delete',
    'designation:view', 'designation:create', 'designation:edit', 'designation:delete',
    'leave:request:view', 'leave:request:view_own', 'leave:request:create', 'leave:request:cancel', 'leave:request:approve', 'leave:request:delete',
    'leave:type:view', 'leave:type:create', 'leave:type:edit', 'leave:type:delete',
    'leave:balance:view', 'leave:balance:view_own', 'leave:balance:edit', 'leave:balance:allocate',
    'holiday:view', 'holiday:create', 'holiday:update', 'holiday:delete',
    'admin:permission:view', 'admin:permission:edit'
  ],
  admin: [
    'user:view',
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:block',
    'department:view', 'designation:view',
    'leave:request:view', 'leave:request:view_own', 'leave:request:create', 'leave:request:cancel', 'leave:request:approve', 'leave:request:delete',
    'leave:type:view', 'leave:type:create', 'leave:type:edit', 'leave:type:delete',
    'leave:balance:view', 'leave:balance:view_own', 'leave:balance:edit', 'leave:balance:allocate',
    'holiday:view', 'holiday:create', 'holiday:update', 'holiday:delete',
    'admin:permission:view', 'admin:permission:edit'
  ],
  manager: [
    'employee:view',
    'leave:request:view', 'leave:request:view_own', 'leave:request:create', 'leave:request:cancel', 'leave:request:approve',
    'leave:balance:view', 'leave:balance:view_own',
  ],
  teamleader: [
    'leave:request:view_own', 'leave:request:create', 'leave:request:cancel',
    'leave:balance:view_own',
  ],
  employee: [
    'leave:request:view_own', 'leave:request:create', 'leave:request:cancel',
    'leave:balance:view_own',
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
    { key: 'leave:request:view',     label: 'View All Leaves' },
    { key: 'leave:request:view_own', label: 'View Own Leaves' },
    { key: 'leave:request:create',   label: 'Create Leave Requests' },
    { key: 'leave:request:cancel',   label: 'Cancel Leave Requests' },
    { key: 'leave:request:approve',  label: 'Approve/Reject Leaves' },
    { key: 'leave:request:delete',   label: 'Delete Leaves' },
  ],
  LeaveType: [
    { key: 'leave:type:view',   label: 'View Leave Types' },
    { key: 'leave:type:create', label: 'Create Leave Types' },
    { key: 'leave:type:edit',   label: 'Edit Leave Types' },
    { key: 'leave:type:delete', label: 'Delete Leave Types' },
  ],
  LeaveBalance: [
    { key: 'leave:balance:view',     label: 'View All Leave Balances' },
    { key: 'leave:balance:view_own', label: 'View Own Leave Balances' },
    { key: 'leave:balance:edit',     label: 'Edit Leave Balances' },
    { key: 'leave:balance:allocate', label: 'Allocate Leave Balances' },
  ],
  Holiday: [
    { key: 'holiday:view',   label: 'View Holidays' },
    { key: 'holiday:create', label: 'Create Holidays' },
    { key: 'holiday:update', label: 'Edit Holidays' },
    { key: 'holiday:delete', label: 'Delete Holidays' },
  ],
  Permission: [
    { key: 'admin:permission:view', label: 'View Permissions' },
    { key: 'admin:permission:edit', label: 'Edit Permissions' },
  ]
}
