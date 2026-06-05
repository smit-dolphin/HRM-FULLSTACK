import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Employees } from '@/pages/Employees';
import { Leaves } from '@/pages/Leaves';
import { LoginPage } from '@/pages/LoginPage';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="leaves" element={<Leaves />} />
              <Route path="settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
