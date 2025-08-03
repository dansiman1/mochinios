import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const RegisterPaymentModal = ({ isOpen, setIsOpen, account, onPaymentSuccess }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { crud } = useData();
  const cxcCrud = crud('cxc');
  const transactionsCrud = crud('transacciones_financieras');
  const accountsCrud = crud('cuentas_bancarias');
  const { items: bankAccounts } = accountsCrud;
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const { items: clients } = crud('clientes');
  
  const { toast } = useToast();

  useEffect(() => {
    if (account) {
      setPaymentAmount(account.saldoPendiente.toFixed(2));
    }
    if (bankAccounts.length > 0 && !selectedBankAccount) {
        setSelectedBankAccount(bankAccounts[0].id);
    }
  }, [account, bankAccounts, isOpen]);

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nombre : 'Cliente Desconocido';
  };

  const handleRegisterPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!account || isNaN(amount) || amount <= 0 || amount > account.saldoPendiente) {
      toast({
        title: 'Error de Validación',
        description: `El monto del pago debe ser un número positivo y no mayor al saldo pendiente de $${account.saldoPendiente.toFixed(2)}.`,
        variant: 'destructive',
      });
      return;
    }

    if (!selectedBankAccount) {
        toast({
            title: 'Error de Validación',
            description: 'Por favor, selecciona una cuenta de destino para el pago.',
            variant: 'destructive',
        });
        return;
    }

    const newSaldoPendiente = account.saldoPendiente - amount;
    const newStatus = newSaldoPendiente <= 0.001 ? 'Pagado' : 'Parcial';

    cxcCrud.updateItem(account.id, {
      saldoPendiente: newSaldoPendiente,
      estado: newStatus
    });

    transactionsCrud.addItem({
      cuentaId: selectedBankAccount,
      tipo: 'ingreso',
      importe: amount,
      fecha: paymentDate,
      descripcion: `Abono del pedido #${account.pedidoId.toString().slice(-6)} por ${getClientName(account.clienteId)}`,
      categoria: 'Pago cliente',
      relacionId: account.id,
      relacionTipo: 'cxc'
    });

    const bankAccount = accountsCrud.getItemById(selectedBankAccount);
    if(bankAccount){
        accountsCrud.updateItem(selectedBankAccount, {
            saldoActual: bankAccount.saldoActual + amount
        });
    }

    toast({
      title: 'Pago Registrado Exitosamente',
      description: `Se registró un pago de $${amount.toFixed(2)} para el pedido #${account.pedidoId.toString().slice(-6)}.`,
    });

    onPaymentSuccess();
    setIsOpen(false);
  };

  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar Pago para Pedido #{account.pedidoId.toString().slice(-6)}</DialogTitle>
          <DialogDescription>
            Cliente: <span className="font-bold">{getClientName(account.clienteId)}</span>. Saldo pendiente: <span className="font-bold text-primary">${account.saldoPendiente.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-amount" className="text-right">Monto a Pagar</Label>
            <Input id="payment-amount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="col-span-3" placeholder="0.00" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-date" className="text-right">Fecha de Pago</Label>
            <Input id="payment-date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bank-account" className="text-right">Depositar en</Label>
             <div className="col-span-3">
                <Select onValueChange={setSelectedBankAccount} value={selectedBankAccount}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                        {bankAccounts.map(bAccount => (
                            <SelectItem key={bAccount.id} value={bAccount.id}>{bAccount.nombre} (${bAccount.saldoActual.toFixed(2)})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleRegisterPayment}>Registrar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterPaymentModal;