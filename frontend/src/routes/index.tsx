import { Routes, Route } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { Users } from "@/pages/Users";
import { Employees } from "@/pages/Employees";
import { Roles } from "@/pages/Roles";
import { Leaves } from "@/pages/Leaves";
import { Holidays } from "@/pages/Holidays";
import { Projects } from "@/pages/Projects";
import { Tasks } from "@/pages/Tasks";
import { Breaks } from "@/pages/Breaks";
import { Departments } from "@/pages/Departments";
import { Designations } from "@/pages/Designations";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/roles" element={<Roles />} />
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/holidays" element={<Holidays />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/breaks" element={<Breaks />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/designations" element={<Designations />} />
    </Routes>
  );
}
