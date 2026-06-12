import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Employees } from '@/pages/Employees';
import { Leaves } from '@/pages/Leaves';
import { ManageLeaves } from '@/pages/ManageLeaves';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/leaves/manage" element={<ManageLeaves />} />
    </Routes>
  );
}
