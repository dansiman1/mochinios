import React, { useState, useEffect } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PRICE_LISTS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/Combobox';
import { format } from 'date-fns';
import { ClientDetailsModal } from '../clients/ClientDetailsModal';

export const OrderForm = ({ onSave, onCancel }) => {
    const { crud } = useData();
    const { currentUser } = useAuth();
    const { items: products } = crud('inventario');
    const { items: clients } = crud('clientes');
    const { items: users } = crud('usuarios');

    const [isClientModalOpen, setClientModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        clienteId: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        metodoPago: 'contado',
        diasCredito: '0',
        estado: 'Pendiente',
        vendedor_id: currentUser?.id || '',
        productos: [{ productoId: '', cantidad: 1, precioUnitario: 0, almacen: 'tienda' }]
    });
    const [selectedClient, setSelectedClient] = useState(null);
    const { toast } = useToast();

    const clientOptions = clients.map(c => ({ value: c.id, label: c.nombre }));
    const sellerOptions = users.map(u => ({ value: u.id, label: u.nombre }));
    const productOptions = products
        .filter(p => Object.values(p.stockPorAlmacen || {}).reduce((a, b) => a + b, 0) > 0)
        .map(p => ({ 
            value: p.id, 
            label: `${p.nombre} (Total: ${Object.values(p.stockPorAlmacen || {}).reduce((a, b) => a + b, 0)})` 
        }));

    useEffect(() => {
        if (formData.clienteId) {
            const client = clients.find(c => c.id === formData.clienteId);
            setSelectedClient(client);
        } else {
            setSelectedClient(null);
        }
    }, [formData.clienteId, clients]);

    const getPriceForClient = (product) => {
        if (!product || !selectedClient) return 0;
        const priceListId = selectedClient.priceList || 'p1';
        return product.precios?.[priceListId] || 0;
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleProductChange = (index, field, value) => {
        const newProductos = [...formData.productos];
        newProductos[index][field] = value;
        if (field === 'productoId') {
            const product = products.find(p => p.id === value);
            newProductos[index].precioUnitario = getPriceForClient(product);
            newProductos[index].cantidad = 1;
        }
        setFormData(prev => ({ ...prev, productos: newProductos }));
    };

    const addProductField = () => {
        setFormData(prev => ({ ...prev, productos: [...prev.productos, { productoId: '', cantidad: 1, precioUnitario: 0, almacen: 'tienda' }] }));
    };

    const removeProductField = (index) => {
        const newProductos = formData.productos.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, productos: newProductos }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.clienteId) {
            toast({ title: "Error de Validación", description: "Por favor, selecciona un cliente.", variant: "destructive" });
            return;
        }
        
        for (const item of formData.productos) {
            if (!item.productoId || !item.cantidad || Number(item.cantidad) <= 0) {
                 toast({ title: "Error de Validación", description: "Asegúrate de seleccionar un producto y una cantidad válida.", variant: "destructive" });
                return;
            }
            const product = products.find(p => p.id === item.productoId);
            const stockEnAlmacen = product?.stockPorAlmacen?.[item.almacen] || 0;
            if (!product || Number(item.cantidad) > stockEnAlmacen) {
                toast({
                    title: "Error de Stock",
                    description: `No hay suficientes existencias para "${product?.nombre}" en el almacén "${item.almacen}". Disponibles: ${stockEnAlmacen}.`,
                    variant: "destructive",
                });
                return;
            }
        }
        
        const total = formData.productos.reduce((acc, item) => acc + (item.precioUnitario * Number(item.cantidad)), 0);
        onSave({ ...formData, total });
    };
    
    const priceListName = selectedClient ? (PRICE_LISTS.find(p => p.id === selectedClient.priceList)?.name || 'N/A') : 'N/A';
    const totalPedido = formData.productos.reduce((acc, item) => acc + (item.precioUnitario * Number(item.cantidad)), 0);

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 py-4 max-h-[75vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                        <Label htmlFor="clienteId">Cliente</Label>
                        <Combobox
                            options={clientOptions}
                            value={formData.clienteId}
                            onSelect={(value) => handleFormChange('clienteId', value)}
                            placeholder="Seleccionar cliente..."
                            onAddNew={() => setClientModalOpen(true)}
                        />
                        {selectedClient && (
                            <div className="mt-2">
                                <Badge variant="secondary">Lista de Precios: {priceListName}</Badge>
                            </div>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="vendedor_id">Vendedor</Label>
                        <Combobox
                            options={sellerOptions}
                            value={formData.vendedor_id}
                            onSelect={(value) => handleFormChange('vendedor_id', value)}
                            placeholder="Seleccionar vendedor..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input id="fecha" type="date" value={formData.fecha} onChange={e => handleFormChange('fecha', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="metodoPago">Método de Pago</Label>
                        <Select value={formData.metodoPago} onValueChange={(value) => handleFormChange('metodoPago', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="contado">Contado</SelectItem>
                                <SelectItem value="credito">Crédito</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {formData.metodoPago === 'credito' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="diasCredito">Días de Crédito</Label>
                            <Input id="diasCredito" type="number" value={formData.diasCredito} onChange={e => handleFormChange('diasCredito', e.target.value)} min="0" />
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-lg font-medium">Productos</Label>
                    <div className="space-y-2">
                        {formData.productos.map((p, index) => {
                            const selectedProduct = products.find(prod => prod.id === p.productoId);
                            return (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 border rounded-lg">
                                    <div className="sm:col-span-5">
                                        <Combobox
                                            options={productOptions}
                                            value={p.productoId}
                                            onSelect={(value) => handleProductChange(index, 'productoId', value)}
                                            placeholder="Producto..."
                                            disabled={!selectedClient}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Cant."
                                            value={p.cantidad}
                                            onChange={e => handleProductChange(index, 'cantidad', e.target.value)}
                                            className="w-full"
                                            min="1"
                                            required
                                            disabled={!selectedClient}
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <Select value={p.almacen} onValueChange={(value) => handleProductChange(index, 'almacen', value)} disabled={!selectedClient || !selectedProduct}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Almacén" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedProduct && Object.keys(selectedProduct.stockPorAlmacen || {}).map(almacen => (
                                                    <SelectItem key={almacen} value={almacen} className="capitalize">
                                                        {almacen} ({selectedProduct.stockPorAlmacen[almacen]})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="sm:col-span-1 text-center font-medium">
                                        ${(p.precioUnitario * p.cantidad).toFixed(2)}
                                    </div>
                                    <div className="sm:col-span-1 flex justify-end">
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeProductField(index)} disabled={formData.productos.length === 1}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addProductField} disabled={!selectedClient}>Añadir Producto</Button>
                </div>
                
                <div className="text-right text-2xl font-bold pt-4 border-t">
                    Total: ${totalPedido.toFixed(2)}
                </div>

                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Crear Pedido</Button>
                </DialogFooter>
            </form>
            {isClientModalOpen && (
                <ClientDetailsModal
                    isOpen={isClientModalOpen}
                    onClose={() => setClientModalOpen(false)}
                    client={null}
                />
            )}
        </>
    );
};