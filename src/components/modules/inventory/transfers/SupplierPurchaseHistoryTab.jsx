import React, { useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SupplierPurchaseHistoryTab = ({ supplier }) => {
    const { crud } = useData();
    const { items: allPurchases } = crud('cxp');

    const supplierPurchases = useMemo(() => {
        if (!supplier) return [];
        return allPurchases
            .filter(p => p.proveedorId === supplier.id)
            .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
    }, [allPurchases, supplier]);

    if (!supplier) return null;

    return (
        <div className="space-y-6 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                    <CardDescription>Todas las facturas registradas para {supplier.nombre}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Factura ID</TableHead>
                                <TableHead>Fecha Emisión</TableHead>
                                <TableHead>Monto Total</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supplierPurchases.length > 0 ? supplierPurchases.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>#{p.facturaId}</TableCell>
                                    <TableCell>{format(parseISO(p.fechaEmision), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>${p.montoTotal.toFixed(2)}</TableCell>
                                    <TableCell><Badge variant={p.estado === 'Pagado' ? 'success' : 'secondary'}>{p.estado}</Badge></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan="4" className="h-24 text-center">Este proveedor no tiene compras registradas.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplierPurchaseHistoryTab;