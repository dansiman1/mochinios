import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Combobox } from '@/components/Combobox';
import { PlusCircle } from 'lucide-react';

const NewTransactionModal = ({ isOpen, setIsOpen, onTransactionCreated, initialAccountId }) => {
  const { crud } = useData();
  const { items: accounts, updateItem: updateAccount } = crud('cuentas_bancarias');
  const { addItem: addTransaction } = crud('transacciones_financieras');
  const { items: categories, addItem: addCategory } = crud('categorias_gastos');
  
  const [cuentaId, setCuentaId] = useState('');
  const [tipo, setTipo] = useState('egreso');
  const [importe, setImporte] = useState('');
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      setCuentaId(initialAccountId || (accounts.length > 0 ? accounts[0].id : ''));
      setTipo('egreso');
      setImporte('');
      setFecha(format(new Date(), 'yyyy-MM-dd'));
      setDescripcion('');
      setCategoriaId('');
      setNewCategoryName('');
    }
  }, [initialAccountId, isOpen, accounts]);

  const handleCreateCategory = () => {
      if (!newCategoryName.trim()) return;
      const existingCategory = categories.find(c => c.nombre.toLowerCase() === newCategoryName.trim().toLowerCase());
      if (existingCategory) {
          toast({ title: "Categoría Duplicada", description: "Esta categoría ya existe.", variant: "destructive" });
          return;
      }
      const newCat = addCategory({ nombre: newCategoryName.trim() });
      setCategoriaId(newCat.id);
      setNewCategoryName('');
      toast({ title: "Categoría Creada", description: `Se añadió "${newCategoryName.trim()}".`});
  };

  const handleCreateTransaction = () => {
    if (!cuentaId || !tipo || !importe || !fecha || !descripcion) {
      toast({ title: 'Campos requeridos', description: 'Por favor, completa todos los campos.', variant: 'destructive' });
      return;
    }
    if (tipo === 'egreso' && !categoriaId) {
      toast({ title: 'Categoría Requerida', description: 'Por favor, selecciona una categoría para el egreso.', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(importe);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Importe inválido', description: 'El importe debe ser un número positivo.', variant: 'destructive' });
      return;
    }
    
    const selectedAccount = accounts.find(a => a.id === cuentaId);
    if (!selectedAccount) {
         toast({ title: 'Error', description: 'La cuenta seleccionada no es válida.', variant: 'destructive' });
         return;
    }

    if(tipo === 'egreso' && (Number(selectedAccount.saldo) || 0) < amount) {
        toast({ title: 'Saldo Insuficiente', description: `La cuenta "${selectedAccount.nombre_banco}" no tiene saldo suficiente.`, variant: 'destructive' });
        return;
    }
    
    addTransaction({
      cuenta_id: cuentaId,
      tipo,
      monto: amount,
      fecha: new Date(fecha).toISOString(),
      descripcion,
      categoria_id: tipo === 'egreso' ? categoriaId : null,
    });
    
    const currentBalance = Number(selectedAccount.saldo) || 0;
    const newBalance = tipo === 'ingreso' ? currentBalance + amount : currentBalance - amount;
    updateAccount(cuentaId, { saldo: newBalance });

    toast({ title: 'Movimiento Registrado', description: `Se ha registrado un ${tipo} de ${amount.toFixed(2)}.` });

    onTransactionCreated();
    setIsOpen(false);
  };
  
  const categoryOptions = useMemo(() => categories.map(c => ({ value: c.id, label: c.nombre })), [categories]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg w-[95%] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Movimiento</DialogTitle>
          <DialogDescription>Añade un nuevo ingreso o egreso a una de tus cuentas.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-grow overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Cuenta</Label>
            <Select onValueChange={setCuentaId} value={cuentaId}>
              <SelectTrigger><SelectValue placeholder="Selecciona una cuenta" /></SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.nombre_banco} - {acc.numero_cuenta} (${(Number(acc.saldo) || 0).toFixed(2)})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select onValueChange={setTipo} value={tipo}>
              <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="egreso">Egreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Importe</Label>
            <Input id="amount" type="number" value={importe} onChange={e => setImporte(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          {tipo === 'egreso' && (
            <>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Combobox options={categoryOptions} value={categoriaId} onSelect={setCategoriaId} placeholder="Seleccionar categoría..." />
              </div>
              <div className="space-y-2">
                    <Label htmlFor="new-category">O crear nueva categoría</Label>
                    <div className="flex gap-2">
                        <Input id="new-category" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Ej: Renta, Nómina, etc." />
                        <Button type="button" size="icon" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}><PlusCircle className="h-4 w-4" /></Button>
                    </div>
                </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Pago de renta de local" />
          </div>
        </div>
        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleCreateTransaction}>Guardar Movimiento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;