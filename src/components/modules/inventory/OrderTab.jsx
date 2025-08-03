import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { OrderForm } from './OrderForm';
import { OrderDetailsModal } from './OrderDetailsModal';
import { getStatusInfo, ORDER_STATUSES } from '@/lib/orderStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays } from 'date-fns';

const OrderTab = ({ locationState }) => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: products, updateItem: updateProduct } = crud('inventario');
    const { items: orders, addItem: addOrder, updateItem: updateOrder } = crud('pedidos');
    const { items: clients } = crud('clientes');
    const cxcCrud = crud('cxc');
    const accountsCrud = crud('cuentas_bancarias');
    const transactionsCrud = crud('transacciones_financieras');

    const [isOrderFormOpen, setOrderFormOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');

    useEffect(() => {
        if (locationState?.openOrder) {
            const orderToOpen = orders.find(o => o.id === locationState.openOrder);
            if (orderToOpen) {
                handleViewDetails(orderToOpen);
            }
        }
    }, [locationState, orders]);

    const handleSaveOrder = (data) => {
        const newOrder = addOrder(data);

        data.productos.forEach(item => {
            const product = products.find(p => p.id === item.productoId);
            if (product) {
                const newStockPorAlmacen = { ...product.stockPorAlmacen };
                newStockPorAlmacen[item.almacen] = (newStockPorAlmacen[item.almacen] || 0) - Number(item.cantidad);
                
                const newMovimientos = [...(product.movimientos || []), {
                    fecha: new Date().toISOString(),
                    tipo: 'Venta',
                    cantidad: item.cantidad,
                    usuario: 'admin',
                    notas: `Pedido #${newOrder.id}`
                }];

                updateProduct(product.id, { ...product, stockPorAlmacen: newStockPorAlmacen, existencias: product.existencias - item.cantidad, movimientos: newMovimientos });
            }
        });

        if (data.metodoPago === 'credito') {
            const fechaEmision = new Date(data.fecha);
            const fechaVencimiento = addDays(fechaEmision, Number(data.diasCredito));

            cxcCrud.addItem({
                clienteId: data.clienteId,
                pedidoId: newOrder.id,
                montoTotal: data.total,
                saldoPendiente: data.total,
                fechaEmision: fechaEmision.toISOString(),
                fechaVencimiento: fechaVencimiento.toISOString(),
                estado: 'Pendiente'
            });
            toast({ title: "✅ Pedido Creado", description: "El stock ha sido actualizado y la cuenta por cobrar generada." });
        } else {
             // For 'contado' sales, directly create an income transaction
             // Assuming a default cash account or user selects one later in POS
             const defaultCashAccount = accountsCrud.items.find(acc => acc.nombre.toLowerCase().includes('caja')) || accountsCrud.items[0];
             if (defaultCashAccount) {
                 accountsCrud.updateItem(defaultCashAccount.id, {
                     saldoActual: defaultCashAccount.saldoActual + data.total
                 });
                 transactionsCrud.addItem({
                     cuentaId: defaultCashAccount.id,
                     tipo: 'ingreso',
                     importe: data.total,
                     fecha: newOrder.fecha,
                     descripcion: `Venta al contado Pedido #${newOrder.id}`,
                     categoria: 'Venta',
                     relacionId: newOrder.id,
                     relacionTipo: 'pedido'
                 });
                 toast({ title: "✅ Pedido Creado", description: "El stock ha sido actualizado y el pago registrado en caja." });
             } else {
                 toast({ title: "✅ Pedido Creado", description: "El stock ha sido actualizado. Por favor, registra el pago manualmente." });
             }
        }
        setOrderFormOpen(false);
    };

    const handleStatusChange = (order, newStatus) => {
        const originalStatus = order.estado;
        const wasStockReduced = ['En Proceso', 'Enviado', 'Entregado'].includes(originalStatus);
        const willStockBeRestored = ['Cancelado', 'Devuelto'].includes(newStatus);

        if (wasStockReduced && willStockBeRestored) {
            order.productos.forEach(item => {
                const product = products.find(p => p.id === item.productoId);
                if (product) {
                    const newStockPorAlmacen = { ...product.stockPorAlmacen };
                    newStockPorAlmacen[item.almacen] = (newStockPorAlmacen[item.almacen] || 0) + Number(item.cantidad);

                    const newMovimientos = [...(product.movimientos || []), {
                        fecha: new Date().toISOString(),
                        tipo: newStatus === 'Cancelado' ? 'Cancelación' : 'Devolución',
                        cantidad: item.cantidad,
                        usuario: 'admin',
                        notas: `Pedido #${order.id}`
                    }];

                    updateProduct(product.id, { ...product, stockPorAlmacen: newStockPorAlmacen, existencias: product.existencias + item.cantidad, movimientos: newMovimientos });
                }
            });
            toast({ title: "Stock Restaurado", description: "El inventario ha sido actualizado." });
        }
        
        updateOrder(order.id, { ...order, estado: newStatus });
        toast({ title: "✅ Estado Actualizado", description: `Pedido ahora está ${newStatus}.` });
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter(o => {
                if (statusFilter === 'Todos') return true;
                return o.estado === statusFilter;
            })
            .filter(o => {
                if (!orderSearchTerm) return true;
                const client = clients.find(c => c.id === o.clienteId);
                return client?.nombre.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                       o.id.toString().includes(orderSearchTerm) ||
                       o.fecha.includes(orderSearchTerm);
            });
    }, [orders, clients, orderSearchTerm, statusFilter]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Gestión de Pedidos</CardTitle>
                            <CardDescription>Crea y administra los pedidos internos.</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar..." className="pl-8 w-full" value={orderSearchTerm} onChange={e => setOrderSearchTerm(e.target.value)} />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Todos">Todos los estados</SelectItem>
                                        {ORDER_STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setOrderFormOpen(true)} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Pedido</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table className="responsive-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Pedido</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? filteredOrders.map(o => {
                                const client = clients.find(c => c.id === o.clienteId);
                                const statusInfo = getStatusInfo(o.estado);
                                return (
                                    <TableRow key={o.id}>
                                        <TableCell data-label="ID Pedido" className="font-mono">#{o.id.toString().slice(-6)}</TableCell>
                                        <TableCell data-label="Cliente">{client?.nombre || 'N/A'}</TableCell>
                                        <TableCell data-label="Fecha">{o.fecha}</TableCell>
                                        <TableCell data-label="Total">${o.total?.toFixed(2) || '0.00'}</TableCell>
                                        <TableCell data-label="Estado"><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                                        <TableCell data-label="Acciones" className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(o)}>Ver Detalles</DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Cambiar Estado</DropdownMenuSubTrigger>
                                                        <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                {ORDER_STATUSES.map(status => (
                                                                    <DropdownMenuItem key={status} onClick={() => handleStatusChange(o, status)} disabled={o.estado === status}>
                                                                        {status}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuPortal>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(o, 'Cancelado')} disabled={o.estado === 'Cancelado' || o.estado === 'Entregado' || o.estado === 'Devuelto'} className="text-red-500">
                                                        Cancelar Pedido
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : <TableRow><TableCell colSpan="6" className="h-24 text-center">No hay pedidos.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={isOrderFormOpen} onOpenChange={setOrderFormOpen}>
                <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95%]">
                    <DialogHeader>
                        <DialogTitle className="text-xl md:text-2xl">Nuevo Pedido</DialogTitle>
                        <DialogDescription>Completa los detalles para crear un nuevo pedido.</DialogDescription>
                    </DialogHeader>
                    <OrderForm onSave={handleSaveOrder} onCancel={() => setOrderFormOpen(false)} />
                </DialogContent>
            </Dialog>
            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    isOpen={isDetailsModalOpen} 
                    onClose={() => setDetailsModalOpen(false)} 
                />
            )}
        </>
    );
};

export default OrderTab;