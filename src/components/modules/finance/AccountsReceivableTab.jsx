import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import Papa from 'papaparse';
import RegisterPaymentModal from '@/components/modules/finance/modals/RegisterPaymentModal.jsx';

const getStatusInfo = (status) => {
  switch (status) {
    case 'Pagado': return { label: 'Pagado', variant: 'success' };
    case 'Parcial': return { label: 'Parcial', variant: 'warning' };
    case 'Vencido': return { label: 'Vencido', variant: 'destructive' };
    case 'Pendiente':
    default:
      return { label: 'Pendiente', variant: 'secondary' };
  }
};

const AccountsReceivableTab = () => {
  const { crud } = useData();
  const { items: cxc, refreshData } = crud('cxc');
  const { items: clients } = crud('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nombre : 'Cliente Desconocido';
  };

  const filteredCxC = useMemo(() => {
    return cxc.filter(item => {
      const clientName = getClientName(item.cliente_id).toLowerCase();
      const orderId = item.pedido_id?.toString().slice(-6).toLowerCase() || '';
      return clientName.includes(searchTerm.toLowerCase()) || orderId.includes(searchTerm.toLowerCase());
    });
  }, [cxc, clients, searchTerm]);

  const handleOpenModal = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    crud('cxc').refreshData();
    crud('cuentas_bancarias').refreshData();
  };

  const handleExport = () => {
    const dataToExport = filteredCxC.map(item => ({
      'ID Pedido': item.pedido_id,
      'Cliente': getClientName(item.cliente_id),
      'Monto Total': (Number(item.monto) || 0).toFixed(2),
      'Saldo Pendiente': (Number(item.saldoPendiente) || 0).toFixed(2),
      'Fecha Emisión': format(new Date(item.fecha_emision), 'dd/MM/yyyy'),
      'Fecha Vencimiento': format(new Date(item.fecha_vencimiento), 'dd/MM/yyyy'),
      'Estado': item.estado,
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'cuentas_por_cobrar.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Cuentas por Cobrar (CxC)</CardTitle>
              <CardDescription>Gestión de créditos y pagos de clientes.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por cliente o pedido..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="outline" onClick={handleExport} className="flex-shrink-0"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Pedido ID</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCxC.length > 0 ? filteredCxC.map(item => {
                const status = getStatusInfo(item.estado);
                return (
                  <TableRow key={item.id}>
                    <TableCell data-label="Cliente">{getClientName(item.cliente_id)}</TableCell>
                    <TableCell data-label="Pedido ID">#{item.pedido_id?.toString().slice(-6)}</TableCell>
                    <TableCell data-label="Monto Total">${(Number(item.monto) || 0).toFixed(2)}</TableCell>
                    <TableCell data-label="Saldo Pendiente">${(Number(item.saldoPendiente) || 0).toFixed(2)}</TableCell>
                    <TableCell data-label="Fecha Vencimiento">{format(new Date(item.fecha_vencimiento), 'dd/MM/yyyy')}</TableCell>
                    <TableCell data-label="Estado"><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell data-label="Acciones" className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0" disabled={item.estado === 'Pagado'}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenModal(item)} disabled={item.estado === 'Pagado'}>Registrar Pago</DropdownMenuItem>
                          <DropdownMenuItem>Ver Pedido</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan="7" className="h-24 text-center">No hay cuentas por cobrar pendientes.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedAccount && (
        <RegisterPaymentModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          account={selectedAccount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default AccountsReceivableTab;