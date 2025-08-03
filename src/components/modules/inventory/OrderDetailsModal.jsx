import React, { useState, useEffect } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusInfo, ORDER_STATUSES } from '@/lib/orderStatus';

export const OrderDetailsModal = ({ order, isOpen, onClose }) => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: products, setItems: setProducts } = crud('inventario');
    const { items: clients } = crud('clientes');
    const { updateItem: updateOrder } = crud('pedidos');
    
    const [currentStatus, setCurrentStatus] = useState(order?.estado || 'Pendiente');

    useEffect(() => {
        if (order) {
            setCurrentStatus(order.estado);
        }
    }, [order]);

    if (!order) return null;

    const client = clients.find(c => c.id === order.clienteId);

    const handleStatusChange = (newStatus) => {
        setCurrentStatus(newStatus);
    };

    const handleSaveChanges = () => {
        const originalStatus = order.estado;
        const wasStockReduced = ['En Proceso', 'Enviado', 'Entregado'].includes(originalStatus);
        const willStockBeRestored = ['Cancelado', 'Devuelto'].includes(currentStatus);

        if (!wasStockReduced && willStockBeRestored) {
            // Stock was never reduced, so no need to restore
        } else if (wasStockReduced && willStockBeRestored) {
            // Restore stock
            const newProducts = [...products];
            order.productos.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productoId);
                if (productIndex !== -1) {
                    newProducts[productIndex].existencias = Number(newProducts[productIndex].existencias) + Number(item.cantidad);
                }
            });
            setProducts(newProducts);
            toast({ title: "Stock Restaurado", description: "El inventario ha sido actualizado." });
        }
        
        updateOrder(order.id, { ...order, estado: currentStatus });
        toast({ title: "✅ Pedido Actualizado", description: `El estado del pedido ahora es ${currentStatus}.` });
        onClose();
    };

    const statusInfo = getStatusInfo(order.estado);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detalle del Pedido #{order.id.toString().slice(-6)}</DialogTitle>
                    <DialogDescription>
                        Cliente: {client?.nombre || 'N/A'} | Fecha: {order.fecha}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="font-medium">Estado Actual:</span>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        {order.metodoPago && (
                             <span className="font-medium">| Método de Pago: <Badge variant="secondary">{order.metodoPago}</Badge></span>
                        )}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Precio Unit.</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.productos.map((p, index) => {
                                const product = products.find(prod => prod.id === p.productoId);
                                const subtotal = p.cantidad * p.precioUnitario;
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{product?.nombre || 'Producto no encontrado'}</TableCell>
                                        <TableCell>{p.cantidad}</TableCell>
                                        <TableCell>${p.precioUnitario.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <div className="text-right font-bold text-lg">
                        Total: ${order.total.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t">
                        <span className="font-medium">Cambiar Estado:</span>
                        <Select value={currentStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {ORDER_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};