import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { GeneralInfoTab } from './GeneralInfoTab';
import TransactionsTab from './TransactionsTab';
import { AccountStatementTab } from './AccountStatementTab';
import { User, FileText, FileClock } from 'lucide-react';

export const ClientDetailsModal = ({ isOpen, onClose, client }) => {
    const { crud } = useData();
    const { items: allOrders } = crud('pedidos');
    const { addItem: addClient, updateItem: updateClient } = crud('clientes');
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("general");
    const [clientData, setClientData] = useState(client || {});

    useEffect(() => {
        if(isOpen) {
            setClientData(client || {});
            setActiveTab("general");
        }
    }, [client, isOpen]);

    const handleSave = () => {
        if (clientData?.id) {
            updateClient(clientData.id, clientData);
            toast({ title: "✅ Cliente Actualizado", description: "La información del cliente ha sido guardada." });
        } else {
            addClient(clientData);
            toast({ title: "✅ Cliente Creado", description: "El nuevo cliente ha sido registrado." });
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95%] h-[90vh] flex flex-col p-4 md:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl">{clientData?.nombre ? `Ficha de Cliente: ${clientData.nombre}` : 'Nuevo Cliente'}</DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                        {clientData?.id ? 'Edita la información, consulta transacciones y genera estados de cuenta.' : 'Rellena la información para registrar un nuevo cliente.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-hidden mt-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col md:flex-row md:gap-6">
                        <TabsList className="flex flex-row md:flex-col md:w-1/5 h-auto justify-start items-stretch p-1 responsive-tabs-list">
                            <TabsTrigger value="general" className="justify-start text-xs md:text-sm"><User className="mr-2 h-4 w-4" />Info General</TabsTrigger>
                            <TabsTrigger value="transactions" disabled={!clientData?.id} className="justify-start text-xs md:text-sm"><FileText className="mr-2 h-4 w-4" />Transacciones</TabsTrigger>
                            <TabsTrigger value="statement" disabled={!clientData?.id} className="justify-start text-xs md:text-sm"><FileClock className="mr-2 h-4 w-4" />Estado de Cuenta</TabsTrigger>
                        </TabsList>
                        <div className="flex-grow overflow-y-auto md:w-4/5 mt-4 md:mt-0 md:pr-4">
                            <TabsContent value="general" className="h-full">
                                <GeneralInfoTab currentClient={clientData} setClientData={setClientData} />
                            </TabsContent>
                            {clientData?.id && (
                                <>
                                    <TabsContent value="transactions">
                                        <TransactionsTab client={clientData} orders={allOrders} />
                                    </TabsContent>
                                    <TabsContent value="statement">
                                        <AccountStatementTab client={clientData} />
                                    </TabsContent>
                                </>
                            )}
                        </div>
                    </Tabs>
                </div>
                 {activeTab === 'general' && (
                    <DialogFooter className="mt-auto pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};