import React, { useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getStatusInfo } from '@/lib/orderStatus';
import { format } from 'date-fns';

const MyOrdersModule = () => {
  const { crud } = useData();
  const { currentClient } = useAuth();
  const { items: allOrders } = crud('pedidos');

  const clientOrders = useMemo(() => {
    if (!currentClient) return [];
    // Using mock client id 1 for admin test user
    const clientIdToFilter = currentClient.rol === 'Administrador' ? 1 : currentClient.id;
    return allOrders
      .filter(order => order.clienteId === clientIdToFilter)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [allOrders, currentClient]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pedidos</CardTitle>
        <CardDescription>Aquí puedes ver todos los pedidos que has realizado.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="md:hidden space-y-4">
            {clientOrders.length > 0 ? clientOrders.map(order => {
                 const statusInfo = getStatusInfo(order.estado);
                 return (
                    <div key={order.id} className="bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-semibold font-mono">#{order.id.toString().slice(-6)}</span>
                           <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><span className="font-medium">Fecha:</span> {format(new Date(order.fecha), 'dd/MM/yyyy')}</p>
                            <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
                        </div>
                    </div>
                 )
            }) : (
                 <div className="h-24 text-center flex items-center justify-center text-muted-foreground">Aún no has realizado ningún pedido.</div>
            )}
        </div>
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>ID Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientOrders.length > 0 ? clientOrders.map(order => {
              const statusInfo = getStatusInfo(order.estado);
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">#{order.id.toString().slice(-6)}</TableCell>
                  <TableCell>{format(new Date(order.fecha), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan="4" className="h-24 text-center">Aún no has realizado ningún pedido.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MyOrdersModule;