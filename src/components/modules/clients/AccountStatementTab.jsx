import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStatusInfo } from '@/lib/orderStatus';
import { format } from 'date-fns';
import { useData } from '@/hooks/useDataContext';

export const AccountStatementTab = ({ client }) => {
  const { crud } = useData();
  const { items: allOrders } = crud('pedidos');
  const clientOrders = allOrders.filter(order => order.cliente_id === client.id);

  const balance = clientOrders.reduce((acc, order) => {
    if (order.estado === 'Pagado') {
      return acc;
    }
    return acc + (order.total || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Resumen de Cuenta</h3>
        <p className="text-sm text-muted-foreground">Saldo pendiente: <span className="font-bold text-destructive">${balance.toFixed(2)}</span></p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Pedido</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientOrders.length > 0 ? (
            clientOrders.map((item) => {
              const statusInfo = getStatusInfo(item.estado);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">#{item.id.toString().slice(-6)}</TableCell>
                  <TableCell>{format(new Date(item.fecha_pedido), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${(item.total || 0).toFixed(2)}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan="4" className="h-24 text-center">
                No hay movimientos en el estado de cuenta.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};