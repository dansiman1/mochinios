import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CustomerReport = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reporte de Clientes</CardTitle>
                <CardDescription>Esta sección está en desarrollo.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Aquí se mostrarán los análisis sobre clientes, incluyendo los más frecuentes, saldos de crédito y resumen de membresías.</p>
            </CardContent>
        </Card>
    );
};

export default CustomerReport;