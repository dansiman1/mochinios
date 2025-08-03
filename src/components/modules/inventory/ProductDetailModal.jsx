import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, History, DollarSign, Lock, Unlock, Shapes } from 'lucide-react';
import { InfoInventoryTab } from './InfoInventoryTab';
import { HistoryTab } from './HistoryTab';
import { PricingTab } from './PricingTab';
import { VariantsTab } from './VariantsTab';
import { PinUnlockDialog } from './PinUnlockDialog';
import { useToast } from '@/components/ui/use-toast';

export const ProductDetailModal = ({ isOpen, onClose, product, onSave }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({});
    const [isPinDialogOpen, setPinDialogOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(true);

    useEffect(() => {
        if (product) {
            setFormData(product);
        }
        // Always start locked when modal opens, or for a new product
        setIsLocked(true); 
    }, [product, isOpen]);

    const generateSubSKUs = (baseSKU, packConfig, variants) => {
        const subSkus = [];
        if (!baseSKU || !packConfig) return subSkus;
    
        Object.entries(packConfig).forEach(([packKey, config]) => {
            if (config.type === 'assorted') {
                subSkus.push({
                    variant: { color: 'Surtido', talla: '' },
                    pack: packKey,
                    subSku: `${baseSKU}-${packKey.toUpperCase()}-SURT`,
                    quantity: config.quantity
                });
            }
        });
    
        const piecePackKey = Object.keys(packConfig).find(key => packConfig[key].type === 'piece');
        if (piecePackKey) {
            const config = packConfig[piecePackKey];
            (variants || []).forEach(variant => {
                const colorCode = variant.color ? `-${variant.color.toUpperCase().replace(/\s/g, '')}` : '';
                const tallaCode = variant.talla ? `-${variant.talla.toUpperCase().replace(/\s/g, '')}` : '';
                subSkus.push({
                    variant,
                    pack: piecePackKey,
                    subSku: `${baseSKU}${colorCode}${tallaCode}-${piecePackKey.toUpperCase()}`,
                    quantity: config.quantity
                });
            });
        }
    
        return subSkus;
    };

    const handleSave = () => {
        if (!formData.sku || !formData.nombre) {
             toast({
                title: "Campos requeridos",
                description: "Por favor, completa el nombre y el SKU del producto.",
                variant: "destructive",
            });
            return;
        }

        for (const key in formData.packConfig) {
            if (!formData.packConfig[key].quantity || Number(formData.packConfig[key].quantity) <= 0) {
                toast({
                    title: "Error de Configuración",
                    description: `La cantidad para el empaque "${formData.packConfig[key].name}" debe ser un número mayor que cero.`,
                    variant: "destructive",
                });
                return;
            }
        }
        
        // Stock should not be calculated or saved from here
        const totalStock = formData.id ? (formData.existencias || 0) : 0;
        
        const allSubSKUs = generateSubSKUs(formData.sku, formData.packConfig, formData.variants || []);
        
        const finalData = { 
            ...formData, 
            existencias: totalStock, 
            subSkus: allSubSKUs
        };
        
        if (!finalData.id) { // If it's a new product
            finalData.stockPorAlmacen = { bodega: 0, tienda: 0, oficina: 0 };
        }

        onSave(finalData);
    };

    const handleUnlock = () => {
        setIsLocked(false);
        setPinDialogOpen(false);
        toast({ title: "🔓 Desbloqueado", description: "Ahora puedes editar los campos protegidos." });
    };
    
    const handleToggleLock = () => {
        if (isLocked) {
            setPinDialogOpen(true);
        } else {
            setIsLocked(true);
            toast({ title: "🔒 Bloqueado", description: "Los campos de precios y stock han sido protegidos." });
        }
    };


    if (!product) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-7xl w-[95%] h-[90vh] flex flex-col p-4 md:p-6">
                    <DialogHeader className="pr-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                             <div>
                                <DialogTitle className="text-xl md:text-2xl">{product.id ? `Ficha de Producto: ${product.nombre}` : 'Crear Nuevo Producto'}</DialogTitle>
                                <DialogDescription className="text-xs md:text-sm">
                                    {product.id ? "Gestiona la información, variantes y precios." : "Define la información base del nuevo producto."}
                                </DialogDescription>
                            </div>
                            <div className="absolute top-4 right-14">
                                <Button onClick={handleToggleLock} variant="outline" size="sm" className="flex items-center gap-2">
                                    {isLocked ? <Lock className="h-4 w-4 text-destructive" /> : <Unlock className="h-4 w-4 text-green-500" />}
                                    {isLocked ? 'Bloqueado' : 'Desbloqueado'}
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="flex-grow overflow-hidden mt-4">
                        <Tabs defaultValue="info" className="h-full flex flex-col md:flex-row md:gap-6">
                            <TabsList className="flex flex-row md:flex-col md:w-1/5 h-auto justify-start items-stretch p-1 responsive-tabs-list">
                                <TabsTrigger value="info" className="justify-start text-xs md:text-sm"><Info className="mr-2 h-4 w-4" />Info General</TabsTrigger>
                                <TabsTrigger value="variants" className="justify-start text-xs md:text-sm"><Shapes className="mr-2 h-4 w-4" />Variantes y SKUs</TabsTrigger>
                                <TabsTrigger value="pricing" className="justify-start text-xs md:text-sm"><DollarSign className="mr-2 h-4 w-4" />Precios</TabsTrigger>
                                <TabsTrigger value="history" disabled={!product.id} className="justify-start text-xs md:text-sm"><History className="mr-2 h-4 w-4" />Historial</TabsTrigger>
                            </TabsList>
                            <div className="flex-grow overflow-y-auto md:w-4/5 mt-4 md:mt-0 md:pr-4">
                                <TabsContent value="info">
                                    <InfoInventoryTab formData={formData} setFormData={setFormData} isLocked={isLocked}/>
                                </TabsContent>
                                <TabsContent value="variants">
                                    <VariantsTab formData={formData} setFormData={setFormData} />
                                </TabsContent>
                                <TabsContent value="pricing">
                                    <PricingTab formData={formData} setFormData={setFormData} isLocked={isLocked}/>
                                </TabsContent>
                                {product.id && (
                                    <TabsContent value="history">
                                        <HistoryTab product={formData} />
                                    </TabsContent>
                                )}
                            </div>
                        </Tabs>
                    </div>
                    <DialogFooter className="mt-auto pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <PinUnlockDialog
                isOpen={isPinDialogOpen}
                onClose={() => setPinDialogOpen(false)}
                onUnlock={handleUnlock}
            />
        </>
    );
};