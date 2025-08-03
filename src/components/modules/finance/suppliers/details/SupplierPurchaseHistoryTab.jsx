import React, { useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const SupplierPurchaseHistoryTab = ({ supplier }) => {
  const { crud } = useData();
  const { items: cxpItems } = crud('cxp');

  const purchaseHistory = useMemo(() => {
    if (!supplier) return [];
    return cxpItems
      .filter(item => item.proveedor_id === supplier.id)
      .sort((a, b) => new Date(b.fecha_emision || b.fecha_vencimiento) - new Date(a.fecha_emision || a.fecha_vencimiento));
  }, [supplier, cxpItems]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Compras</CardTitle>
        <CardDescription>Todas las facturas y compras registradas con {supplier?.nombre}.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Factura #</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead className="text-right">Saldo Pendiente</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseHistory.length > 0 ? purchaseHistory.map(item => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.fecha_emision || item.fecha_vencimiento), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{item.facturaRef || `CXP-${item.id}`}</TableCell>
                <TableCell>{item.descripcion}</TableCell>
                <TableCell className="text-right font-medium">${(Number(item.monto) || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold text-red-500">${((Number(item.monto) || 0) - (Number(item.pagado) || 0)).toFixed(2)}</TableCell>
                <TableCell><Badge variant={item.estado === 'Pagado' ? 'success' : (item.estado === 'Parcial' ? 'warning' : 'destructive')}>{item.estado}</Badge></TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan="6" className="h-24 text-center">No hay compras registradas.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SupplierPurchaseHistoryTab;