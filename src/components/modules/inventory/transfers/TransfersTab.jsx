import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { Combobox } from '@/components/Combobox';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { PinUnlockDialog } from '../PinUnlockDialog';

const TransfersTab = () => {
    const { crud } = useData();
    const { currentUser } = useAuth();
    const { toast } = useToast();

    const { items: products, updateItem: updateProduct } = crud('inventario');
    const { items: transfers, addItem: addTransfer } = crud('traspasos');

    const [fromWarehouse, setFromWarehouse] = useState('');
    const [toWarehouse, setToWarehouse] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isPinDialogOpen, setPinDialogOpen] = useState(false);

    const warehouses = ['tienda', 'oficina', 'bodega'];

    const productOptions = useMemo(() =>
        products.map(p => ({ value: p.id, label: `${p.nombre} (${p.sku})` })),
        [products]
    );

    const handleAttemptTransfer = () => {
        if (!fromWarehouse || !toWarehouse || !selectedProductId || !quantity) {
            toast({ title: "Campos incompletos", description: "Por favor, rellena todos los campos.", variant: "destructive" });
            return;
        }
        if (fromWarehouse === toWarehouse) {
            toast({ title: "Error de Lógica", description: "La bodega de origen y destino no pueden ser la misma.", variant: "destructive" });
            return;
        }
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            toast({ title: "Cantidad Inválida", description: "La cantidad debe ser un número positivo.", variant: "destructive" });
            return;
        }

        const product = products.find(p => p.id === selectedProductId);
        if (!product) {
            toast({ title: "Producto no encontrado", variant: "destructive" });
            return;
        }

        const stockInFromWarehouse = product.stockPorAlmacen?.[fromWarehouse] || 0;
        if (stockInFromWarehouse < qty) {
            toast({ title: "Stock Insuficiente", description: `Solo hay ${stockInFromWarehouse} piezas en la bodega "${fromWarehouse}".`, variant: "destructive" });
            return;
        }

        setPinDialogOpen(true);
    };

    const executeTransfer = () => {
        setPinDialogOpen(false);
        const qty = parseInt(quantity, 10);
        const product = products.find(p => p.id === selectedProductId);

        const newStockPorAlmacen = {
            ...product.stockPorAlmacen,
            [fromWarehouse]: (product.stockPorAlmacen?.[fromWarehouse] || 0) - qty,
            [toWarehouse]: (product.stockPorAlmacen?.[toWarehouse] || 0) + qty,
        };

        const newMovement = {
            fecha: new Date().toISOString(),
            tipo: 'Traspaso',
            cantidad: qty,
            usuario: currentUser?.nombre || 'Sistema',
            notas: `Traspaso de ${qty} pz de ${fromWarehouse} a ${toWarehouse}`,
        };

        updateProduct(product.id, {
            stockPorAlmacen: newStockPorAlmacen,
            movimientos: [...(product.movimientos || []), newMovement],
        });

        addTransfer({
            productId: product.id,
            productName: product.nombre,
            from: fromWarehouse,
            to: toWarehouse,
            quantity: qty,
            date: new Date().toISOString(),
            user: currentUser?.nombre || 'Sistema',
        });

        toast({ title: "✅ Traspaso Exitoso", description: `Se movieron ${qty} piezas de ${product.nombre}.` });
        setFromWarehouse('');
        setToWarehouse('');
        setSelectedProductId('');
        setQuantity('');
    };

    const sortedTransfers = useMemo(() => 
        transfers.sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transfers]);

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Realizar Traspaso de Inventario</CardTitle>
                        <CardDescription>Mueve productos entre tus bodegas. Esta acción requiere autorización.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-2">
                            <label>Desde Bodega</label>
                            <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                                <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(w => <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label>Hacia Bodega</label>
                            <Select value={toWarehouse} onValueChange={setToWarehouse}>
                                <SelectTrigger><SelectValue placeholder="Destino" /></SelectTrigger>
                                <SelectContent>
                                    {warehouses.map(w => <SelectItem key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label>Producto</label>
                            <Combobox options={productOptions} value={selectedProductId} onSelect={setSelectedProductId} placeholder="Buscar producto..." />
                        </div>
                        <div className="space-y-2">
                            <label>Cantidad</label>
                            <Input type="number" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
                        </div>
                        <div className="md:col-span-2 lg:col-span-5">
                            <Button onClick={handleAttemptTransfer} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Realizar Traspaso</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Traspasos</CardTitle>
                        <CardDescription>Registro de todos los movimientos entre bodegas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table className="responsive-table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Origen</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                    <TableHead>Usuario</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTransfers.length > 0 ? sortedTransfers.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell data-label="Fecha">{format(new Date(t.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell data-label="Producto">{t.productName}</TableCell>
                                        <TableCell data-label="Origen">{t.from}</TableCell>
                                        <TableCell data-label="Destino">{t.to}</TableCell>
                                        <TableCell data-label="Cantidad" className="text-right">{t.quantity}</TableCell>
                                        <TableCell data-label="Usuario">{t.user}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan="6" className="h-24 text-center">No hay traspasos registrados.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <PinUnlockDialog
                isOpen={isPinDialogOpen}
                onClose={() => setPinDialogOpen(false)}
                onUnlock={executeTransfer}
            />
        </>
    );
};

export default TransfersTab;