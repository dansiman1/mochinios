import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SupplierDetailsModal } from './SupplierDetailsModal';

const SuppliersTab = () => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: suppliers, deleteItem } = crud('proveedores');
    const { items: cxp } = crud('cxp');

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const supplierBalances = useMemo(() => {
        const balances = {};
        cxp.forEach(item => {
            if (item.proveedor_id) { 
                const saldo = (Number(item.monto) || 0) - (Number(item.pagado) || 0);
                balances[item.proveedor_id] = (balances[item.proveedor_id] || 0) + saldo;
            }
        });
        return balances;
    }, [cxp]);

    const handleAddNew = () => {
        setSelectedSupplier(null);
        setModalOpen(true);
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSupplier(null);
    };

    const handleDelete = (id) => {
        deleteItem(id);
        toast({ title: "🗑️ Proveedor Eliminado", variant: "destructive" });
    };

    const filteredSuppliers = useMemo(() =>
        suppliers.filter(s =>
            s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contacto?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [suppliers, searchTerm]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Catálogo de Proveedores</CardTitle>
                            <CardDescription>Administra la información y saldos de tus proveedores.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nombre o correo..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={handleAddNew} className="flex-shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Proveedor</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table className="responsive-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Saldo Pendiente</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
                                <TableRow key={supplier.id}>
                                    <TableCell data-label="Nombre" className="font-medium">{supplier.nombre}</TableCell>
                                    <TableCell data-label="Email">{supplier.contacto?.email || 'N/A'}</TableCell>
                                    <TableCell data-label="Teléfono">{supplier.contacto?.telefono || 'N/A'}</TableCell>
                                    <TableCell data-label="Saldo Pendiente" className="font-semibold text-destructive">${(supplierBalances[supplier.id] || 0).toFixed(2)}</TableCell>
                                    <TableCell data-label="Acciones" className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(supplier)}><Edit className="mr-2 h-4 w-4" /> Ver Ficha Completa</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(supplier.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan="5" className="h-24 text-center">No se encontraron proveedores.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {isModalOpen && (
                <SupplierDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    supplier={selectedSupplier}
                />
            )}
        </>
    );
};

export default SuppliersTab;