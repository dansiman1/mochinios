import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/hooks/useDataContext';
import { Combobox } from '@/components/Combobox';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { SupplierDetailsModal } from '../suppliers/SupplierDetailsModal';

export const NewPayableModal = ({ isOpen, onClose, onSave, cxp, productInfo: initialProductInfo }) => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: suppliers, addItem: addSupplier } = crud('proveedores');
    const { items: products } = crud('inventario');
    const { items: bankAccounts } = crud('cuentas_bancarias');

    const [isSupplierModalOpen, setSupplierModalOpen] = useState(false);

    const productOptions = useMemo(() => products.map(p => ({ value: p.id, label: `${p.nombre} (SKU: ${p.sku})` })), [products]);
    const supplierOptions = useMemo(() => suppliers.map(s => ({ value: s.id, label: s.nombre })), [suppliers]);
    const warehouseOptions = useMemo(() => [
        { value: 'bodega', label: 'Bodega Principal' },
        { value: 'tienda', label: 'Punto de Venta (Tienda)' },
    ], []);
    const accountOptions = useMemo(() => bankAccounts.map(a => ({ value: a.id, label: `${a.nombre_banco} - ${a.numero_cuenta}` })), [bankAccounts]);

    const initialLineItem = { productId: '', quantity: 1, price: '' };
    const getInitialFormData = () => ({
        facturaRef: '',
        fecha: new Date(),
        proveedor_id: '',
        lineItems: [initialLineItem],
        paymentMethod: 'credito',
        paymentTerm: '30',
        paymentAccountId: '',
        warehouse: 'bodega',
        estado: 'Pendiente',
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
        }
    }, [isOpen]);
    
    const handleAddLineItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { ...initialLineItem }]
        }));
    };

    const handleRemoveLineItem = (index) => {
        if (formData.lineItems.length > 1) {
            const newLineItems = [...formData.lineItems];
            newLineItems.splice(index, 1);
            setFormData(prev => ({ ...prev, lineItems: newLineItems }));
        }
    };

    const handleLineItemChange = (index, field, value) => {
        const newLineItems = [...formData.lineItems];
        newLineItems[index][field] = value;
        setFormData(prev => ({ ...prev, lineItems: newLineItems }));
    };

    const handleProductSelect = (index, productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const newLineItems = [...formData.lineItems];
            newLineItems[index].productId = productId;
            newLineItems[index].price = product.precio_compra || '';
            setFormData(prev => ({ ...prev, lineItems: newLineItems }));
        }
    };
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const totalAmount = useMemo(() => {
        return formData.lineItems.reduce((acc, item) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            return acc + (quantity * price);
        }, 0);
    }, [formData.lineItems]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.proveedor_id) {
            toast({ title: "Error", description: "Selecciona un proveedor.", variant: "destructive" });
            return;
        }

        if (formData.lineItems.some(item => !item.productId || !item.quantity || !item.price)) {
            toast({ title: "Error", description: "Completa todos los campos de los productos.", variant: "destructive" });
            return;
        }
        
        const purchaseData = {
            ...formData,
            monto: totalAmount,
            estado: formData.paymentMethod === 'contado' ? 'Pagado' : 'Pendiente'
        };
        
        onSave(purchaseData);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl w-[95%] h-[90vh] flex flex-col p-4 md:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl md:text-2xl">Registrar Nueva Compra a Proveedor</DialogTitle>
                        <DialogDescription>
                            Crea una factura de compra para añadir inventario y generar una cuenta por pagar.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-grow overflow-y-auto pr-2 mt-4 space-y-6">
                        {/* Header */}
                        <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
                            <div>
                                <Label htmlFor="facturaRef">No. de Factura</Label>
                                <Input id="facturaRef" placeholder="Ej. F-12345" value={formData.facturaRef} onChange={e => handleInputChange('facturaRef', e.target.value)} />
                            </div>
                            <div>
                                <Label>Fecha</Label>
                                <Input value={format(formData.fecha, 'dd/MM/yyyy')} disabled />
                            </div>
                            <div>
                                <Label htmlFor="proveedor_id">Proveedor</Label>
                                <Combobox
                                    options={supplierOptions}
                                    value={formData.proveedor_id}
                                    onSelect={(value) => handleInputChange('proveedor_id', value)}
                                    placeholder="Seleccionar proveedor..."
                                    onAddNew={() => setSupplierModalOpen(true)}
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Productos</Label>
                            {formData.lineItems.map((item, index) => (
                                <div key={index} className="grid md:grid-cols-12 gap-2 items-end p-3 border rounded-md">
                                    <div className="md:col-span-6">
                                        <Label>Producto</Label>
                                        <Combobox options={productOptions} value={item.productId} onSelect={(value) => handleProductSelect(index, value)} placeholder="Seleccionar producto..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor={`quantity-${index}`}>Cant.</Label>
                                        <Input id={`quantity-${index}`} type="number" min="1" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label htmlFor={`price-${index}`}>Precio Compra (Unitario)</Label>
                                        <Input id={`price-${index}`} type="number" step="0.01" value={item.price} onChange={e => handleLineItemChange(index, 'price', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-1 flex items-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)} disabled={formData.lineItems.length <= 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={handleAddLineItem} className="mt-2">
                                <PlusCircle className="h-4 w-4 mr-2" /> Añadir Producto
                            </Button>
                        </div>
                        
                        {/* Footer Details */}
                        <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
                            <div>
                                <Label>Método de Pago</Label>
                                <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credito">Crédito</SelectItem>
                                        <SelectItem value="contado">Contado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.paymentMethod === 'credito' && (
                                <div>
                                    <Label>Plazo (días)</Label>
                                    <Input type="number" value={formData.paymentTerm} onChange={e => handleInputChange('paymentTerm', e.target.value)} />
                                </div>
                            )}
                            {formData.paymentMethod === 'contado' && (
                                <div>
                                    <Label>Cuenta de Pago</Label>
                                    <Combobox options={accountOptions} value={formData.paymentAccountId} onSelect={(value) => handleInputChange('paymentAccountId', value)} placeholder="Seleccionar cuenta..." />
                                </div>
                            )}
                            <div>
                                <Label>Almacén de Destino</Label>
                                <Combobox options={warehouseOptions} value={formData.warehouse} onSelect={(value) => handleInputChange('warehouse', value)} placeholder="Seleccionar almacén..." />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-auto pt-4 border-t flex-col-reverse sm:flex-row sm:justify-between items-center">
                        <div className="text-2xl font-bold">
                            Total: ${totalAmount.toFixed(2)}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleSubmit}>Realizar Compra</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {isSupplierModalOpen && (
                <SupplierDetailsModal
                    isOpen={isSupplierModalOpen}
                    onClose={() => setSupplierModalOpen(false)}
                    supplier={null}
                />
            )}
        </>
    );
};