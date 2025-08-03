import React, { useState } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generatePayrollReceipt } from '../utils/receiptGenerator';

const PayrollFormModal = ({ isOpen, onClose }) => {
    const { crud } = useData();
    const { items: employees } = crud('empleados');
    const { items: bankAccounts } = crud('cuentas_bancarias');
    const { addItem: addPayroll } = crud('nominas');
    const { addItem: addTransaction } = crud('transacciones_financieras');
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        empleado_id: '',
        cuenta_bancaria_id: '',
        periodo_inicio: '',
        periodo_fin: '',
        monto_neto: '',
        concepto: 'Nómina',
    });
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [lastPayrollData, setLastPayrollData] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const montoNeto = parseFloat(formData.monto_neto) || 0;

        const employee = employees.find(emp => emp.id.toString() === formData.empleado_id);

        const transaction = {
            cuenta_id: parseInt(formData.cuenta_bancaria_id),
            tipo: 'egreso',
            monto: montoNeto,
            descripcion: `${formData.concepto} a ${employee?.nombre}`,
            fecha: new Date().toISOString(),
        };
        const newTransaction = addTransaction(transaction);

        const payrollData = {
            ...formData,
            empleado_id: parseInt(formData.empleado_id),
            cuenta_bancaria_id: parseInt(formData.cuenta_bancaria_id),
            monto_bruto: montoNeto,
            monto_neto: montoNeto,
            fecha_pago: new Date().toISOString().split('T')[0],
            transaccion_id: newTransaction.id,
            estado: 'Pagado',
        };

        const newPayroll = addPayroll(payrollData);
        setLastPayrollData({ ...newPayroll, employee, bankAccount: bankAccounts.find(b => b.id.toString() === formData.cuenta_bancaria_id) });
        toast({ title: "✅ Pago Registrado Correctamente" });
        onClose();
        setShowPrintDialog(true);
    };

    const handlePrint = () => {
        if (lastPayrollData) {
            generatePayrollReceipt(lastPayrollData, lastPayrollData.employee, lastPayrollData.bankAccount);
        }
        setShowPrintDialog(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Pago</DialogTitle>
                        <DialogDescription>Completa los detalles para registrar un nuevo pago a un empleado.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="empleado_id" className="text-right">Empleado</Label>
                            <Select onValueChange={(value) => handleSelectChange('empleado_id', value)} required>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                                <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id.toString()}>{emp.nombre}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cuenta_bancaria_id" className="text-right">Cuenta de Pago</Label>
                            <Select onValueChange={(value) => handleSelectChange('cuenta_bancaria_id', value)} required>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                                <SelectContent>{bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id.toString()}>{`${acc.nombre_banco} - ${acc.numero_cuenta} ($${(acc.saldo || 0).toFixed(2)})`}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="concepto" className="text-right">Concepto</Label>
                            <Input id="concepto" value={formData.concepto} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="periodo_inicio" className="text-right">Inicio Periodo</Label>
                            <Input id="periodo_inicio" type="date" value={formData.periodo_inicio} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="periodo_fin" className="text-right">Fin Periodo</Label>
                            <Input id="periodo_fin" type="date" value={formData.periodo_fin} onChange={handleChange} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="monto_neto" className="text-right">Monto Neto</Label>
                            <Input id="monto_neto" type="number" value={formData.monto_neto} onChange={handleChange} className="col-span-3" required placeholder="$0.00" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit">Registrar Pago</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Imprimir Recibo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            El pago ha sido registrado. ¿Deseas imprimir el recibo de pago ahora?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowPrintDialog(false)}>Más Tarde</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePrint}>Imprimir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default PayrollFormModal;