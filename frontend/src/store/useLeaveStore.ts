import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Leave {
  id: string;
  employeeId: string;
  type: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  reviewedBy?: string;
}

interface LeaveState {
  leaves: Leave[];
  addLeave: (l: Omit<Leave, 'id' | 'appliedOn'>) => void;
  updateLeave: (id: string, updates: Partial<Leave>) => void;
  removeLeave: (id: string) => void;
}

const defaultLeaves: Leave[] = [
  { id: 'LEV001', employeeId: 'EMP002', type: 'Sick', startDate: '2024-06-01', endDate: '2024-06-03', days: 3, reason: 'Fever and flu symptoms', status: 'Approved', appliedOn: '2024-05-31', reviewedBy: 'EMP004' },
  { id: 'LEV002', employeeId: 'EMP003', type: 'Annual', startDate: '2024-07-15', endDate: '2024-07-26', days: 10, reason: 'Family vacation', status: 'Pending', appliedOn: '2024-06-01' },
  { id: 'LEV003', employeeId: 'EMP007', type: 'Personal', startDate: '2024-06-10', endDate: '2024-06-10', days: 1, reason: 'Personal errand', status: 'Approved', appliedOn: '2024-06-05', reviewedBy: 'EMP008' },
  { id: 'LEV004', employeeId: 'EMP005', type: 'Annual', startDate: '2024-05-20', endDate: '2024-05-24', days: 5, reason: 'Rest and relaxation', status: 'Rejected', appliedOn: '2024-05-10', reviewedBy: 'EMP004' },
  { id: 'LEV005', employeeId: 'EMP001', type: 'Sick', startDate: '2024-04-08', endDate: '2024-04-09', days: 2, reason: 'Medical appointment', status: 'Approved', appliedOn: '2024-04-07', reviewedBy: 'EMP004' },
  { id: 'LEV006', employeeId: 'EMP006', type: 'Annual', startDate: '2024-08-01', endDate: '2024-08-07', days: 5, reason: 'Summer holiday', status: 'Pending', appliedOn: '2024-06-03' },
];

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set) => ({
      leaves: defaultLeaves,
      addLeave: (l) =>
        set((s) => ({
          leaves: [...s.leaves, { ...l, id: `LEV${String(Date.now()).slice(-6)}`, appliedOn: new Date().toISOString().split('T')[0] }],
        })),
      updateLeave: (id, updates) =>
        set((s) => ({ leaves: s.leaves.map((l) => (l.id === id ? { ...l, ...updates } : l)) })),
      removeLeave: (id) => set((s) => ({ leaves: s.leaves.filter((l) => l.id !== id) })),
    }),
    { name: 'leave-store' }
  )
);
