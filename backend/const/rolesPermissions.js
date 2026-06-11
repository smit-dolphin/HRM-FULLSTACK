export const rolePermissions = {
  superadmin: ['users.view', 'users.create', 'users.edit', 'users.delete', 'employees.view', 'employees.create', ...],
  admin: ['employees.view', 'employees.create', 'employees.edit', ...],
  manager: ['employees.view'],
  employee: ['leaves.view', 'leaves.create'],
}

