import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Break {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  type: 'Lunch' | 'Tea' | 'Prayer' | 'Personal' | 'Medical' | 'Other';
  status: 'Ongoing' | 'Completed' | 'Approved' | 'Rejected';
  notes?: string;
}

interface BreakState {
  breaks: Break[];
  addBreak: (b: Omit<Break, 'id'>) => void;
  updateBreak: (id: string, updates: Partial<Break>) => void;
  removeBreak: (id: string) => void;
}

const defaultBreaks: Break[] = [
  { id: 'BRK001', employeeId: 'EMP001', date: '2024-06-04', startTime: '13:00', endTime: '14:00', duration: 60, type: 'Lunch', status: 'Completed' },
  { id: 'BRK002', employeeId: 'EMP002', date: '2024-06-04', startTime: '11:30', endTime: '11:45', duration: 15, type: 'Tea', status: 'Completed' },
  { id: 'BRK003', employeeId: 'EMP003', date: '2024-06-04', startTime: '13:15', endTime: '14:00', duration: 45, type: 'Lunch', status: 'Completed' },
  { id: 'BRK004', employeeId: 'EMP004', date: '2024-06-03', startTime: '12:00', endTime: '13:00', duration: 60, type: 'Lunch', status: 'Approved' },
  { id: 'BRK005', employeeId: 'EMP007', date: '2024-06-04', startTime: '15:00', endTime: '15:20', duration: 20, type: 'Prayer', status: 'Completed' },
  { id: 'BRK006', employeeId: 'EMP006', date: '2024-06-03', startTime: '10:00', endTime: '10:30', duration: 30, type: 'Medical', status: 'Approved', notes: 'Medication pickup' },
  { id: 'BRK007', employeeId: 'EMP008', date: '2024-06-04', startTime: '14:00', endTime: '14:45', duration: 45, type: 'Lunch', status: 'Completed' },
  { id: 'BRK008', employeeId: 'EMP005', date: '2024-06-04', startTime: '16:00', endTime: '16:15', duration: 15, type: 'Personal', status: 'Ongoing' },
];

export const useBreakStore = create<BreakState>()(
  persist(
    (set) => ({
      breaks: defaultBreaks,
      addBreak: (b) =>
        set((s) => ({
          breaks: [...s.breaks, { ...b, id: `BRK${String(Date.now()).slice(-6)}` }],
        })),
      updateBreak: (id, updates) =>
        set((s) => ({ breaks: s.breaks.map((b) => (b.id === id ? { ...b, ...updates } : b)) })),
      removeBreak: (id) => set((s) => ({ breaks: s.breaks.filter((b) => b.id !== id) })),
    }),
    { name: 'break-store' }
  )
);
