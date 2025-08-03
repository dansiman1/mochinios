import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { NewPayableModal } from './modals/NewPayableModal';
import RegisterExpenseModal from './modals/RegisterExpenseModal';
import { format, isPast, differenceInDays, addDays } from 'date-fns';

const AccountsPayableTab = ({ locationState }) => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: cxp, addItem: addCxp, updateItem: updateCxp, deleteItem: deleteCxp, refreshData: refreshCxp } = crud('cxp');
    const { items: suppliers } = crud('proveedores');
    const { items: inventory, updateItem: updateInventory } = crud('inventario');
    const { items: bankAccounts, updateItem: updateBankAccount } = crud('cuentas_bancarias');
    const { items: transactions, deleteItem: deleteTransaction, getItemById: getTransactionById } = crud('transacciones_financieras');
    
    const [isPayableModalOpen, setPayableModalOpen] = useState(false);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [selectedCxp, setSelectedCxp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if(locationState?.openNewPayable) {
            setPayableModalOpen(true);
        }
    }, [locationState]);

    const handleSavePurchase = (data) => {
        const totalAmount = data.monto;
        
        const description = data.lineItems.map(item => {
            const product = inventory.find(p => p.id === item.productId);
            return `${item.quantity} x ${product?.nombre || 'Producto desconocido'}`;
        }).join(', ');
        
        let dueDate;
        if (data.paymentMethod === 'credito') {
            dueDate = addDays(new Date(), parseInt(data.paymentTerm, 10));
        } else {
            dueDate = new Date();
        }

        const newCxpData = {
            proveedor_id: data.proveedor_id,
            descripcion: description,
            monto: totalAmount,
            pagado: data.paymentMethod === 'contado' ? totalAmount : 0,
            fecha_vencimiento: dueDate.toISOString().split('T')[0],
            estado: data.estado,
            facturaRef: data.facturaRef,
            items: data.lineItems,
            warehouse: data.warehouse,
            pagos: [],
        };

        const createdCxp = addCxp(newCxpData);

        data.lineItems.forEach(item => {
            const product = inventory.find(p => p.id === item.productId);
            if (product) {
                const stockToAdd = parseInt(item.quantity, 10);
                const newStockPorAlmacen = { ...product.stockPorAlmacen };
                newStockPorAlmacen[data.warehouse] = (newStockPorAlmacen[data.warehouse] || 0) + stockToAdd;
                const newTotalStock = Object.values(newStockPorAlmacen).reduce((sum, val) => sum + Number(val || 0), 0);
                const newMovimientos = [...(product.movimientos || []), {
                    fecha: new Date().toISOString(),
                    tipo: 'Compra',
                    cantidad: stockToAdd,
                    usuario: 'sistema', 
                    notas: `Compra a proveedor, factura #${data.facturaRef}`
                }];
                updateInventory(product.id, { 
                    stockPorAlmacen: newStockPorAlmacen, 
                    existencias: newTotalStock,
                    movimientos: newMovimientos 
                });
            }
        });

        if (data.paymentMethod === 'contado' && data.paymentAccountId) {
            const account = bankAccounts.find(a => a.id === data.paymentAccountId);
            if(account) {
                updateBankAccount(account.id, { saldo: (account.saldo || 0) - totalAmount });
                const newTransaction = crud('transacciones_financieras').addItem({
                    cuenta_id: data.paymentAccountId,
                    tipo: 'egreso',
                    monto: totalAmount,
                    fecha: new Date().toISOString(),
                    descripcion: `Pago de factura #${data.facturaRef}`,
                });
                updateCxp(createdCxp.id, { pagos: [{ transaccion_id: newTransaction.id, monto: totalAmount }] });
            }
        }
        
        toast({ title: '✅ Compra Registrada', description: "La cuenta por pagar y el inventario han sido actualizados." });
        setPayableModalOpen(false);
    };
    
    const handleDeletePurchase = (cxpToDelete) => {
        if (!cxpToDelete) return;
    
        // 1. Revert Inventory
        if (cxpToDelete.items && cxpToDelete.warehouse) {
            cxpToDelete.items.forEach(item => {
                const product = inventory.find(p => p.id === item.productId);
                if (product) {
                    const stockToRemove = parseInt(item.quantity, 10);
                    const newStockPorAlmacen = { ...product.stockPorAlmacen };
                    newStockPorAlmacen[cxpToDelete.warehouse] = Math.max(0, (newStockPorAlmacen[cxpToDelete.warehouse] || 0) - stockToRemove);
                    const newTotalStock = Object.values(newStockPorAlmacen).reduce((sum, val) => sum + Number(val || 0), 0);
                    const newMovimientos = [...(product.movimientos || []), {
                        fecha: new Date().toISOString(),
                        tipo: 'Anulación de Compra',
                        cantidad: -stockToRemove,
                        usuario: 'sistema',
                        notas: `Anulación de factura #${cxpToDelete.facturaRef}`
                    }];
                    updateInventory(product.id, { 
                        stockPorAlmacen: newStockPorAlmacen, 
                        existencias: newTotalStock,
                        movimientos: newMovimientos
                    });
                }
            });
        }
    
        // 2. Revert Payments and Delete Transactions
        if (cxpToDelete.pagos && cxpToDelete.pagos.length > 0) {
            cxpToDelete.pagos.forEach(pago => {
                const transaction = getTransactionById(pago.transaccion_id);
                if (transaction) {
                    const bankAccount = bankAccounts.find(a => a.id === transaction.cuenta_id);
                    if (bankAccount) {
                        updateBankAccount(bankAccount.id, { saldo: (bankAccount.saldo || 0) + (transaction.monto || 0) });
                    }
                    deleteTransaction(transaction.id);
                }
            });
        }
    
        // 3. Delete CXP
        deleteCxp(cxpToDelete.id);
        
        toast({ title: '🗑️ Compra Eliminada', description: "La factura y todos sus movimientos asociados han sido eliminados.", variant: "destructive" });
    };

    const handlePaymentSuccess = () => {
        refreshCxp();
        crud('cuentas_bancarias').refreshData();
        setExpenseModalOpen(false);
        setSelectedCxp(null);
    };

    const getStatusBadge = (status, dueDate) => {
        const date = new Date(dueDate);
        if (status === 'Pagado') return <Badge variant="success">Pagado</Badge>;
        if (isPast(date) && status !== 'Pagado') {
            const daysOverdue = differenceInDays(new Date(), date);
            return <Badge variant="destructive">Vencido ({daysOverdue} días)</Badge>;
        }
        if (status === 'Parcial') return <Badge variant="warning">Parcial</Badge>;
        return <Badge variant="secondary">{status || 'Pendiente'}</Badge>;
    };

    const filteredCxp = useMemo(() => {
        return cxp.filter(c => {
            const supplier = suppliers.find(s => s.id === c.proveedor_id);
            return (
                (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (supplier && supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.facturaRef && c.facturaRef.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }, [cxp, suppliers, searchTerm]);

    const cxpWithDetails = useMemo(() => {
        return filteredCxp.map(c => {
            const supplier = suppliers.find(s => s.id === c.proveedor_id);
            return {
                ...c,
                proveedor: supplier?.nombre || 'N/A',
                saldoPendiente: (Number(c.monto) || 0) - (Number(c.pagado) || 0)
            };
        });
    }, [filteredCxp, suppliers]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Cuentas por Pagar</CardTitle>
                            <CardDescription>Gestiona tus deudas y pagos a proveedores.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por proveedor, factura..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={() => { setSelectedCxp(null); setPayableModalOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Nueva Compra</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table className="responsive-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Factura #</TableHead>
                                <TableHead>Monto Total</TableHead>
                                <TableHead>Saldo Pendiente</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cxpWithDetails.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell data-label="Proveedor">{c.proveedor}</TableCell>
                                    <TableCell data-label="Factura #">{c.facturaRef || c.id}</TableCell>
                                    <TableCell data-label="Monto">${(Number(c.monto) || 0).toFixed(2)}</TableCell>
                                    <TableCell data-label="Saldo Pendiente" className="font-semibold">${c.saldoPendiente.toFixed(2)}</TableCell>
                                    <TableCell data-label="Vencimiento">{format(new Date(c.fecha_vencimiento), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell data-label="Estado">{getStatusBadge(c.estado, c.fecha_vencimiento)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => { setSelectedCxp(c); setExpenseModalOpen(true); }} disabled={c.estado === 'Pagado'}>Registrar Pago</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta operación es irreversible y revertirá la entrada de inventario, además de eliminar cualquier pago asociado a esta factura.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeletePurchase(c)} className="bg-destructive hover:bg-destructive/90">
                                                                Sí, eliminar factura
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <NewPayableModal
                isOpen={isPayableModalOpen}
                onClose={() => setPayableModalOpen(false)}
                onSave={handleSavePurchase}
                cxp={selectedCxp}
                productInfo={locationState?.productInfo}
            />

            {selectedCxp && (
                <RegisterExpenseModal
                    isOpen={isExpenseModalOpen}
                    setIsOpen={setExpenseModalOpen}
                    account={selectedCxp}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
};

export default AccountsPayableTab;