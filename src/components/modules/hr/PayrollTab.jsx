import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search, Trash2, Printer } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import PayrollFormModal from './modals/PayrollFormModal';
import { generatePayrollReceipt } from './utils/receiptGenerator';

const PayrollTab = () => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: payrolls, deleteItem } = crud('nominas');
    const { items: employees } = crud('empleados');
    const { items: bankAccounts } = crud('cuentas_bancarias');

    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddNew = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        deleteItem(id);
        toast({ title: "🗑️ Registro de pago eliminado", variant: "destructive" });
    };

    const handlePrintReceipt = (payroll) => {
        const employee = employees.find(e => e.id === payroll.empleado_id);
        const bankAccount = bankAccounts.find(b => b.id === payroll.cuenta_bancaria_id);
        generatePayrollReceipt(payroll, employee, bankAccount);
    };

    const getEmployeeName = (id) => employees.find(e => e.id === id)?.nombre || 'N/A';

    const filteredPayrolls = useMemo(() => {
        if (!searchTerm) return payrolls;
        return payrolls.filter(p =>
            getEmployeeName(p.empleado_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.concepto && p.concepto.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [payrolls, searchTerm, employees]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Gestión de Pagos</CardTitle>
                            <CardDescription>Registra y consulta los pagos a empleados.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por empleado o concepto..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Pago</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Fecha de Pago</TableHead>
                                <TableHead>Periodo</TableHead>
                                <TableHead>Monto Neto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayrolls.length > 0 ? filteredPayrolls.map(payroll => (
                                <TableRow key={payroll.id}>
                                    <TableCell className="font-medium">{getEmployeeName(payroll.empleado_id)}</TableCell>
                                    <TableCell>{payroll.concepto}</TableCell>
                                    <TableCell>{payroll.fecha_pago}</TableCell>
                                    <TableCell>{`${payroll.periodo_inicio} - ${payroll.periodo_fin}`}</TableCell>
                                    <TableCell className="font-bold">${(payroll.monto_neto || 0).toFixed(2)}</TableCell>
                                    <TableCell><Badge variant="success">{payroll.estado}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handlePrintReceipt(payroll)}><Printer className="mr-2 h-4 w-4" /> Imprimir Recibo</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(payroll.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan="7" className="h-24 text-center">No se encontraron registros de pagos.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {isModalOpen && (
                <PayrollFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default PayrollTab;