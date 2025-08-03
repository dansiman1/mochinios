import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';

const NewAccountModal = ({ isOpen, setIsOpen, onAccountCreated }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('0');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const { crud } = useData();
  const accountsCrud = crud('cuentas_bancarias');
  const { toast } = useToast();

  const handleCreateAccount = () => {
    if (!nombre || !tipo) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, completa el nombre y el tipo de cuenta.',
        variant: 'destructive',
      });
      return;
    }
    if (tipo === 'Cuenta Bancaria' && !numeroCuenta) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor, ingresa el número de cuenta.',
        variant: 'destructive',
      });
      return;
    }

    const saldo = parseFloat(saldoInicial) || 0;

    accountsCrud.addItem({
      nombre,
      tipo,
      saldoActual: saldo,
      numeroCuenta: tipo === 'Cuenta Bancaria' ? numeroCuenta : null,
    });

    toast({
      title: 'Cuenta Creada',
      description: `La cuenta "${nombre}" ha sido creada exitosamente.`,
    });
    
    setIsOpen(false);
    if (onAccountCreated) onAccountCreated();
    // Reset form
    setNombre('');
    setTipo('');
    setSaldoInicial('0');
    setNumeroCuenta('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Nueva Cuenta</DialogTitle>
          <DialogDescription>
            Registra una nueva cuenta bancaria o caja de efectivo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-name" className="text-right">Nombre</Label>
            <Input id="account-name" value={nombre} onChange={(e) => setNombre(e.target.value)} className="col-span-3" placeholder="Ej: BBVA Nómina" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account-type" className="text-right">Tipo</Label>
            <div className="col-span-3">
                <Select onValueChange={setTipo} value={tipo}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Cuenta Bancaria">Cuenta Bancaria</SelectItem>
                        <SelectItem value="Caja de Efectivo">Caja de Efectivo</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          {tipo === 'Cuenta Bancaria' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-number" className="text-right">N° de Cuenta</Label>
              <Input id="account-number" value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} className="col-span-3" placeholder="Ingresa el número de cuenta" />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initial-balance" className="text-right">Saldo Inicial</Label>
            <Input id="initial-balance" type="number" value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} className="col-span-3" placeholder="0.00" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleCreateAccount}>Crear Cuenta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewAccountModal;