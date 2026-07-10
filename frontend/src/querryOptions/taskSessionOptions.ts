import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  startTaskSessionService,
  pauseTaskSessionService,
  completeTaskSessionService
} from '@/services/taskSessionService/taskSessionService'

export function useStartTaskSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => startTaskSessionService(taskId),
    onSuccess: () => {
      // Invalidate relevant queries like active task session, task lists, etc.
      queryClient.invalidateQueries({ queryKey: ['taskSessions'] })
    }
  })
}

export function usePauseTaskSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => pauseTaskSessionService(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskSessions'] })
    }
  })
}

export function useCompleteTaskSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => completeTaskSessionService(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskSessions'] })
    }
  })
}
