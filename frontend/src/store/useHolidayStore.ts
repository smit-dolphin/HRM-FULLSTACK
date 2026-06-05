import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'National' | 'Religious' | 'Optional' | 'Company';
  description: string;
}

interface HolidayState {
  holidays: Holiday[];
  addHoliday: (h: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, updates: Partial<Holiday>) => void;
  removeHoliday: (id: string) => void;
}

const defaultHolidays: Holiday[] = [
  { id: 'HOL001', name: "New Year's Day", date: '2024-01-01', type: 'National', description: 'First day of the new year' },
  { id: 'HOL002', name: "Martin Luther King Jr. Day", date: '2024-01-15', type: 'National', description: 'Federal holiday honoring Dr. Martin Luther King Jr.' },
  { id: 'HOL003', name: "Presidents' Day", date: '2024-02-19', type: 'National', description: 'Federal holiday honoring US Presidents' },
  { id: 'HOL004', name: 'Eid Al-Fitr', date: '2024-04-10', type: 'Religious', description: 'Islamic festival marking end of Ramadan' },
  { id: 'HOL005', name: 'Memorial Day', date: '2024-05-27', type: 'National', description: 'Day honoring US service members who died in war' },
  { id: 'HOL006', name: 'Independence Day', date: '2024-07-04', type: 'National', description: 'US Independence Day' },
  { id: 'HOL007', name: 'Company Anniversary', date: '2024-08-15', type: 'Company', description: 'Annual company founding anniversary' },
  { id: 'HOL008', name: 'Labor Day', date: '2024-09-02', type: 'National', description: 'Honoring American workers' },
  { id: 'HOL009', name: 'Thanksgiving Day', date: '2024-11-28', type: 'National', description: 'Annual national holiday of giving thanks' },
  { id: 'HOL010', name: 'Christmas Day', date: '2024-12-25', type: 'Religious', description: 'Annual Christian holiday' },
];

export const useHolidayStore = create<HolidayState>()(
  persist(
    (set) => ({
      holidays: defaultHolidays,
      addHoliday: (h) =>
        set((s) => ({
          holidays: [...s.holidays, { ...h, id: `HOL${String(Date.now()).slice(-6)}` }],
        })),
      updateHoliday: (id, updates) =>
        set((s) => ({ holidays: s.holidays.map((h) => (h.id === id ? { ...h, ...updates } : h)) })),
      removeHoliday: (id) => set((s) => ({ holidays: s.holidays.filter((h) => h.id !== id) })),
    }),
    { name: 'holiday-store' }
  )
);
