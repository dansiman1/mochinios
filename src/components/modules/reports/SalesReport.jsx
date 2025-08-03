import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SalesReport = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reporte de Ventas</CardTitle>
                <CardDescription>Esta sección está en desarrollo.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí se mostrarán los análisis de ventas, incluyendo totales, ventas por canal y los productos más vendidos.</p>
            </CardContent>
        </Card>
    );
};

export default SalesReport;