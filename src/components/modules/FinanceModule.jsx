import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpCircle, ArrowDownCircle, Banknote, FileText, Users } from 'lucide-react';
import AccountsReceivableTab from './finance/AccountsReceivableTab';
import AccountsPayableTab from './finance/AccountsPayableTab';
import BanksAndCashTab from './finance/BanksAndCashTab';
import FinancialReportsTab from './finance/FinancialReportsTab';
import SuppliersTab from './finance/suppliers/SuppliersTab';

const FinanceModule = ({ locationState }) => {
  const [activeTab, setActiveTab] = useState("cxc");

  useEffect(() => {
    if (locationState?.defaultTab) {
        setActiveTab(locationState.defaultTab);
    }
  }, [locationState]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 responsive-tabs-list">
          <TabsTrigger value="cxc" className="text-xs md:text-sm">
            <ArrowDownCircle className="mr-2 h-4 w-4" /> Cuentas por Cobrar
          </TabsTrigger>
          <TabsTrigger value="cxp" className="text-xs md:text-sm">
            <ArrowUpCircle className="mr-2 h-4 w-4" /> Cuentas por Pagar
          </TabsTrigger>
          <TabsTrigger value="bancos" className="text-xs md:text-sm">
            <Banknote className="mr-2 h-4 w-4" /> Bancos y Cajas
          </TabsTrigger>
          <TabsTrigger value="proveedores" className="text-xs md:text-sm">
            <Users className="mr-2 h-4 w-4" /> Proveedores
          </TabsTrigger>
          <TabsTrigger value="reportes" className="text-xs md:text-sm">
            <FileText className="mr-2 h-4 w-4" /> Reportes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cxc">
          <AccountsReceivableTab />
        </TabsContent>
        <TabsContent value="cxp">
          <AccountsPayableTab locationState={locationState} />
        </TabsContent>
        <TabsContent value="bancos">
          <BanksAndCashTab />
        </TabsContent>
        <TabsContent value="proveedores">
          <SuppliersTab />
        </TabsContent>
        <TabsContent value="reportes">
          <FinancialReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceModule;