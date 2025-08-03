import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStatusInfo } from '@/lib/orderStatus';
import { format } from 'date-fns';

const TransactionsTab = ({ client, orders }) => {
  const clientOrders = orders.filter(order => order.cliente_id === client.id);

  return (
    <div>
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
                No hay transacciones para este cliente.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTab;