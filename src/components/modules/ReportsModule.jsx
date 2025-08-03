import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Package, DollarSign, Users, Star } from 'lucide-react';
import SalesReport from '@/components/modules/reports/SalesReport.jsx';
import InventoryReport from '@/components/modules/reports/InventoryReport.jsx';
import FinanceReport from '@/components/modules/reports/FinanceReport.jsx';
import CustomerReport from '@/components/modules/reports/CustomerReport.jsx';
import KpiDashboard from '@/components/modules/reports/KpiDashboard.jsx';

const ReportsModule = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "kpis");

    useEffect(() => {
        if (location.state?.defaultTab) {
            setActiveTab(location.state.defaultTab);
        }
    }, [location.state]);

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 responsive-tabs-list">
                <TabsTrigger value="kpis"><Star className="mr-2 h-4 w-4" />KPIs</TabsTrigger>
                <TabsTrigger value="sales"><LineChart className="mr-2 h-4 w-4" />Ventas</TabsTrigger>
                <TabsTrigger value="inventory"><Package className="mr-2 h-4 w-4" />Inventario</TabsTrigger>
                <TabsTrigger value="finance"><DollarSign className="mr-2 h-4 w-4" />Finanzas</TabsTrigger>
                <TabsTrigger value="customers"><Users className="mr-2 h-4 w-4" />Clientes</TabsTrigger>
            </TabsList>
            <TabsContent value="kpis" className="mt-4">
                <KpiDashboard />
            </TabsContent>
            <TabsContent value="sales" className="mt-4">
                <SalesReport />
            </TabsContent>
            <TabsContent value="inventory" className="mt-4">
                <InventoryReport />
            </TabsContent>
            <TabsContent value="finance" className="mt-4">
                <FinanceReport />
            </TabsContent>
            <TabsContent value="customers" className="mt-4">
                <CustomerReport />
            </TabsContent>
        </Tabs>
    );
};

export default ReportsModule;