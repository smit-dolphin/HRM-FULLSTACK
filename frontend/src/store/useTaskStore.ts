import { create } from "zustand";
import type { Task } from "@/services/taskService/taskService";

interface TaskStore {
  // State
  tasks: Task[];
  currentTask: Task | null;

  // Actions
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  clearCurrentTask: () => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  // Initial State
  tasks: [],
  currentTask: null,

  // Add task if it doesn't already exist
  addTask: (task) =>
    set((state) => {
      const exists = state.tasks.some((t) => t.id === task.id);

      return {
        tasks: exists ? state.tasks : [...state.tasks, task],
        currentTask: task,
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
    })),

  // Switch active task
  setCurrentTask: (task) =>
    set({
      currentTask: task,
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
    }),
}));