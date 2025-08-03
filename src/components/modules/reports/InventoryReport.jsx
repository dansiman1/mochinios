import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const InventoryReport = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reporte de Inventario</CardTitle>
                <CardDescription>Esta sección está en desarrollo.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí se mostrarán los análisis detallados del inventario, incluyendo stock por almacén, productos con bajo inventario y movimientos recientes.</p>
            </CardContent>
        </Card>
    );
};

export default InventoryReport;