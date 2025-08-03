import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, BarChart, ArrowRightLeft, BookOpen } from 'lucide-react';
import ProductTab from '@/components/modules/inventory/ProductTab';
import OrderTab from '@/components/modules/inventory/OrderTab';
import ReportTab from '@/components/modules/inventory/ReportTab';
import TransfersTab from '@/components/modules/inventory/transfers/TransfersTab.jsx';
import { CatalogTab } from '@/components/modules/inventory/CatalogTab';

const InventoryModule = ({ locationState }) => {
    const [activeTab, setActiveTab] = useState("catalog");

    useEffect(() => {
        if (locationState?.defaultTab) {
            setActiveTab(locationState.defaultTab);
        }
    }, [locationState]);

    const handleEditProduct = (productId) => {
      // Logic to open the product modal can be passed up if needed
      // For now, switching tabs to inventory to show the product list
      setActiveTab("inventory");
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
                <TabsList className="responsive-tabs-list h-auto flex-wrap md:flex-nowrap md:h-10">
                    <TabsTrigger value="catalog"><BookOpen className="mr-2 h-4 w-4" />Catálogo</TabsTrigger>
                    <TabsTrigger value="inventory"><Package className="mr-2 h-4 w-4" />Inventario</TabsTrigger>
                    <TabsTrigger value="transfers"><ArrowRightLeft className="mr-2 h-4 w-4" />Traspasos</TabsTrigger>
                    <TabsTrigger value="orders"><ShoppingCart className="mr-2 h-4 w-4" />Pedidos</TabsTrigger>
                    <TabsTrigger value="reports"><BarChart className="mr-2 h-4 w-4" />Reportes</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="catalog">
                <CatalogTab onEditProduct={handleEditProduct} />
            </TabsContent>
            <TabsContent value="inventory">
                <ProductTab />
            </TabsContent>
            <TabsContent value="transfers">
                <TransfersTab />
            </TabsContent>
            <TabsContent value="orders">
                <OrderTab locationState={locationState} />
            </TabsContent>
            <TabsContent value="reports">
                <ReportTab />
            </TabsContent>
        </Tabs>
    );
};

export default InventoryModule;