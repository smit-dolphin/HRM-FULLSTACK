import React from 'react'
// import { useParams } from 'react-router-dom'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { apiErrorDataShape } from '@/types/sharedTypes'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  fetchAvailablePermissionsService,
  fetchUserPermissionService,
  updateUserPermissionService,
  type PermissionGroups,
} from '@/services/permissionService/permissionService'
import { rolePermissionRoute } from '@/App'

type PermissionState = Record<string, boolean>

export function RolePermission() {
   
  const { id: userId } = rolePermissionRoute.useParams()
  const [permissionGroups, setPermissionGroups] = React.useState<PermissionGroups>({})
  const [selectedPermissions, setSelectedPermissions] = React.useState<PermissionState>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    const loadPermissions = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [availableRes, userRes] = await Promise.all([
          fetchAvailablePermissionsService(),
          fetchUserPermissionService(userId),
        ])

        if (availableRes.success) {
          setPermissionGroups(availableRes.data)
        }

        const nextSelected: PermissionState = {}
        const currentPermissions = userRes.success && userRes.data ? userRes.data.permissions ?? [] : []
        currentPermissions.forEach((permission) => {
          nextSelected[permission] = true
        })
        setSelectedPermissions(nextSelected)
      } catch (error: unknown) {
        const err = error as AxiosError<apiErrorDataShape>
        toast.error(err.response?.data?.message || 'Failed to load permissions')
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [userId])

  const handleTogglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  const handleToggleGroup = (permissions: string[]) => {
    const allChecked = permissions.every((permission) => selectedPermissions[permission])

    setSelectedPermissions((prev) => {
      const nextState = { ...prev }
      permissions.forEach((permission) => {
        nextState[permission] = !allChecked
      })
      return nextState
    })
  }

  const handleSaveChanges = async () => {
    if (!userId) {
      toast.error('Missing user id in the route')
      return
    }

    const permissions = Object.entries(selectedPermissions)
      .filter(([, checked]) => checked)
      .map(([permission]) => permission)

    try {
      setSaving(true)
      const res = await updateUserPermissionService(userId, permissions)
      if (res.success) {
        toast.success(res.message)
      }
    } catch (error: unknown) {
      const err = error as AxiosError<apiErrorDataShape>
      toast.error(err.response?.data?.message || 'Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Permissions"
        subtitle="Manage backend permission keys for the selected user."
      >
        <Button onClick={handleSaveChanges} disabled={saving || loading || !userId}>
          {saving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </PageHeader>

      <div className="border border-border rounded-xl bg-card p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading permissions...</p>
        ) : !userId ? (
          <p className="text-sm text-muted-foreground">Open this page with a user id to manage permissions.</p>
        ) : (
          <div className="space-y-6 divide-y divide-border">
            {Object.entries(permissionGroups).map(([moduleName, permissions]) => {
              const permissionKeys = permissions.map((permission) => permission.key)
              const isAllChecked = permissionKeys.length > 0 && permissionKeys.every((permission) => selectedPermissions[permission])

              return (
                <div key={moduleName} className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-[220px]">
                    <h4 className="text-sm font-semibold text-foreground">{moduleName}</h4>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(permissionKeys)}
                      className="mt-0.5 block text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {isAllChecked ? 'Clear All' : 'Select All'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
                    {permissions.map((permission) => {
                      const checked = Boolean(selectedPermissions[permission.key])

                      return (
                        <label
                          key={permission.key}
                          className={`flex cursor-pointer select-none items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                            checked
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-border bg-secondary text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(permission.key)}
                            className="h-4 w-4 cursor-pointer rounded border-border bg-card text-primary focus:ring-primary"
                          />
                          <span>{permission.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
