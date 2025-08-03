import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LandingPage from '@/pages/LandingPage';
import MembersLogin from '@/pages/MembersLogin';
import EmployeeLogin from '@/pages/EmployeeLogin';
import Dashboard from '@/pages/Dashboard';
import ModulePage from '@/pages/ModulePage';
import PosPage from '@/pages/PosPage';
import ClientDashboard from '@/pages/client/ClientDashboard';
import ClientModulePage from '@/pages/client/ClientModulePage';
import { AnimatePresence } from 'framer-motion';
import { DataProvider } from '@/hooks/useDataContext';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  const location = useLocation();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="mochinios-ui-theme">
      <DataProvider>
        <AuthProvider>
          <div className="relative min-h-screen w-full">
              <div className="absolute inset-0 animated-background z-0"></div>
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/members" element={<MembersLogin />} />
                    <Route path="/os" element={<EmployeeLogin />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/module/:moduleName" element={<ModulePage />} />
                    <Route path="/pos" element={<PosPage />} />
                    
                    <Route path="/client/dashboard" element={<ClientDashboard />} />
                    <Route path="/client/module/:moduleName" element={<ClientModulePage />} />
                  </Routes>
                </AnimatePresence>
                <Toaster />
              </div>
          </div>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;