import { create } from "zustand";
import type { Task } from "@/services/taskService/taskService";
import { persist } from 'zustand/middleware'


interface TaskStore {
  // State
  tasks: Task[];
  currentTask: Task | null;
  currentStatus: "play" | "pause" | "stop"

  // Actions
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  clearCurrentTask: () => void;
  clearTasks: () => void;
  changeStatus: (status: "play" | "pause" | "stop") => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      // Initial State
      tasks: [],
      currentTask: null,
      currentStatus: "pause",
      // Add task if it doesn't already exist
      addTask: (task) =>
        set((state) => {
          const exists = state.tasks.some((t) => t.id === task.id);

          return {
            tasks: exists ? state.tasks : [...state.tasks, task],
            currentTask: task,
            currentStatus: "play"
          };
        }),

      // Remove task
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          currentTask:
            state.currentTask?.id === id
              ? null
              : state.currentTask,
          currentStatus: "stop"
        })),

      // Switch active task
      setCurrentTask: (task) =>
        set({
          currentTask: task,
          currentStatus: "play"
        }),

      // Pause/Stop current task
      clearCurrentTask: () =>
        set({
          currentTask: null,
        }),

      // Clear today's tasks
      clearTasks: () =>
        set({
          tasks: [],
          currentTask: null,
          currentStatus:"stop"
        }),


      changeStatus: (status) =>
        set(() => ({
          currentStatus: status
        }))
    }), {
    name: 'counter-storage', // localStorage key
  }))