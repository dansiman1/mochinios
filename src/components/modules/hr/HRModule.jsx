import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Wallet } from 'lucide-react';
import EmployeesTab from './EmployeesTab';
import AttendanceTab from './AttendanceTab';
import PayrollTab from './PayrollTab';

const HRModule = () => {
  const [activeTab, setActiveTab] = useState("employees");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">
            <Users className="mr-2 h-4 w-4" /> Empleados
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="mr-2 h-4 w-4" /> Asistencia
          </TabsTrigger>
          <TabsTrigger value="payroll">
            <Wallet className="mr-2 h-4 w-4" /> Nómina
          </TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <EmployeesTab />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceTab />
        </TabsContent>
        <TabsContent value="payroll">
          <PayrollTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRModule;