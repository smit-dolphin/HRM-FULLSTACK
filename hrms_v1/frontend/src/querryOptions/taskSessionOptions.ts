import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import {
  startTaskSessionService,
  pauseTaskSessionService,
  completeTaskSessionService,
  getActiveTaskSessionService,
  getActiveSessionsTimeService
} from '@/services/taskSessionService/taskSessionService'

export const activeTaskSessionQueryOptions = queryOptions({
  queryKey: ['taskSessions', 'active'],
  queryFn: () => getActiveTaskSessionService().then(res => res.data),
})

export function useStartTaskSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => startTaskSessionService(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskSessions'] })
      queryClient.invalidateQueries({ queryKey: ['active-time'] })
    }
  })
}

export function usePauseTaskSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => pauseTaskSessionService(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskSessions'] })
      queryClient.invalidateQueries({ queryKey: ['active-time'] })
    }
  })
}

export function useCompleteTaskSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => completeTaskSessionService(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskSessions'] })
      queryClient.invalidateQueries({ queryKey: ['active-time'] })
    }
  })
}

export const useCurrentElepsedTimeTaskSession=queryOptions({
  queryKey:['active-time'],
  queryFn:getActiveSessionsTimeService,
  
})
