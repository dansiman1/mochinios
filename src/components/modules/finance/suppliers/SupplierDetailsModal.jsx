import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/hooks/useDataContext';
import GeneralInfoSupplierTab from './GeneralInfoSupplierTab';
import SupplierPurchaseHistoryTab from './details/SupplierPurchaseHistoryTab';
import SupplierAccountStatementTab from './details/SupplierAccountStatementTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, History, FileClock } from 'lucide-react';

export const SupplierDetailsModal = ({ isOpen, onClose, supplier }) => {
  const { crud } = useData();
  const { addItem, updateItem } = crud('proveedores');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    contacto: {
      email: '',
      telefono: '',
    },
    direccion: {
      calle: '',
      numero: '',
      colonia: '',
      ciudad: '',
      estado: '',
      cp: '',
    },
    notas: '',
  });

  useEffect(() => {
    if (isOpen) {
        if (supplier) {
          setFormData({
            nombre: supplier.nombre || '',
            rfc: supplier.rfc || '',
            contacto: supplier.contacto || { email: '', telefono: '' },
            direccion: supplier.direccion || { calle: '', numero: '', colonia: '', ciudad: '', estado: '', cp: '' },
            notas: supplier.notas || '',
          });
        } else {
          setFormData({
            nombre: '',
            rfc: '',
            contacto: { email: '', telefono: '' },
            direccion: { calle: '', numero: '', colonia: '', ciudad: '', estado: '', cp: '' },
            notas: '',
          });
        }
        setActiveTab("general");
    }
  }, [supplier, isOpen]);

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error de Validación",
        description: "El nombre del proveedor es obligatorio.",
        variant: "destructive",
      });
      return;
    }

    if (supplier) {
      updateItem(supplier.id, formData);
      toast({ title: "✅ Proveedor Actualizado", description: `"${formData.nombre}" ha sido actualizado.` });
    } else {
      addItem(formData);
      toast({ title: "✅ Proveedor Creado", description: `"${formData.nombre}" ha sido añadido al catálogo.` });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95%] h-[90vh] flex flex-col p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">{supplier ? `Ficha de Proveedor: ${formData.nombre}` : 'Nuevo Proveedor'}</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            {supplier ? 'Edita la información, consulta compras y estados de cuenta.' : 'Rellena la información para registrar un nuevo proveedor.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col md:flex-row md:gap-6">
                <TabsList className="flex flex-row md:flex-col md:w-1/5 h-auto justify-start items-stretch p-1 responsive-tabs-list">
                    <TabsTrigger value="general" className="justify-start text-xs md:text-sm"><User className="mr-2 h-4 w-4" />Info General</TabsTrigger>
                    <TabsTrigger value="history" disabled={!supplier} className="justify-start text-xs md:text-sm"><History className="mr-2 h-4 w-4" />Historial</TabsTrigger>
                    <TabsTrigger value="statement" disabled={!supplier} className="justify-start text-xs md:text-sm"><FileClock className="mr-2 h-4 w-4" />Edo. de Cuenta</TabsTrigger>
                </TabsList>
                <div className="flex-grow overflow-y-auto md:w-4/5 mt-4 md:mt-0 md:pr-4">
                    <TabsContent value="general" className="h-full">
                        <GeneralInfoSupplierTab formData={formData} setFormData={setFormData} />
                    </TabsContent>
                    {supplier && (
                        <>
                            <TabsContent value="history">
                                <SupplierPurchaseHistoryTab supplier={supplier} />
                            </TabsContent>
                            <TabsContent value="statement">
                                <SupplierAccountStatementTab supplier={supplier} />
                            </TabsContent>
                        </>
                    )}
                </div>
            </Tabs>
        </div>
        {activeTab === 'general' && (
            <DialogFooter className="mt-auto pt-4 border-t">
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};