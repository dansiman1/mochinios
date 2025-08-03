import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const KpiDashboard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>KPIs Generales del Negocio</CardTitle>
                <CardDescription>Esta sección está en desarrollo.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí se mostrarán los indicadores clave de rendimiento (KPIs) más importantes para el negocio, como el crecimiento de ventas y el ticket promedio.</p>
            </CardContent>
        </Card>
    );
};

export default KpiDashboard;