export const rolePermissions = {
  superadmin: [
    'user:view', 'user:create', 'user:edit', 'user:delete',
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:block',
    'department:view', 'department:create', 'department:edit', 'department:delete',
    'designation:view', 'designation:create', 'designation:edit', 'designation:delete',
    'leave:view', 'leave:create', 'leave:approve', 'leave:delete',
    'leave:type:manage',
    'leave:balance:view', 'leave:balance:edit',
  ],
  admin: [
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:block',
    'user:view',
    'leave:view', 'leave:create', 'leave:approve', 'leave:delete',
    'leave:type:manage',
    'leave:balance:view', 'leave:balance:edit',
    'department:view', 'designation:view',
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
