import React from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';
import  { Navigate, useNavigate } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginForm } from '@/components/forms/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      {/* <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            HRM platform
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Welcome back to HRM
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Sign in to manage employees, leaves, payroll, and day-to-day operations from one clean workspace.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Secure access', 'Role-based login'],
              ['Fast workflow', 'Quick dashboard access'],
              ['Modern UI', 'Polished HR experience'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="font-medium text-slate-900">{title}</div>
                <div className="text-sm text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <LoginForm onSuccess={() => navigate('/', { replace: true })} />
      </div> */}
      <div className="min-h-[90vh] bg-slate-100 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-6 sm:p-8">
            <LoginForm onSuccess={() => navigate({ to:'/',replace: true })} />
          </div>
        </div>
      </div>

    </div>
  );
}
