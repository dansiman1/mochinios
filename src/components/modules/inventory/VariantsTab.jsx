import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Printer, Palette, Scale, Package, Hash, Boxes, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';
import { Textarea } from '@/components/ui/textarea';

export const VariantsTab = ({ formData, setFormData }) => {
    const { toast } = useToast();
    const [colorInput, setColorInput] = useState('');
    const [tallaInput, setTallaInput] = useState('');

    const packConfig = useMemo(() => formData.packConfig || {}, [formData.packConfig]);

    const handlePackConfigChange = (packKey, field, value) => {
        const isQuantity = field === 'quantity';
        const parsedValue = isQuantity ? parseInt(value, 10) : value;

        setFormData(prev => ({
            ...prev,
            packConfig: {
                ...prev.packConfig,
                [packKey]: {
                    ...prev.packConfig[packKey],
                    [field]: isQuantity ? (isNaN(parsedValue) || parsedValue < 0 ? '' : parsedValue) : value
                }
            }
        }));
    };
    
    const handleGenerateCombinations = () => {
        const colors = colorInput.split(',').map(c => c.trim()).filter(Boolean);
        const tallas = tallaInput.split(',').map(t => t.trim()).filter(Boolean);

        if (colors.length === 0 && tallas.length === 0) {
            toast({ title: 'Error', description: 'Ingresa al menos un color o una talla.', variant: 'destructive' });
            return;
        }

        let combinations = [];
        if (colors.length > 0 && tallas.length > 0) {
            colors.forEach(color => {
                tallas.forEach(talla => {
                    combinations.push({ color, talla });
                });
            });
        } else if (colors.length > 0) {
            colors.forEach(color => combinations.push({ color, talla: '' }));
        } else {
            tallas.forEach(talla => combinations.push({ color: '', talla }));
        }

        const existingVariants = formData.variants || [];
        const newVariants = combinations.filter(newVar => 
            !existingVariants.some(exVar => 
                exVar.color.toLowerCase() === newVar.color.toLowerCase() && 
                exVar.talla.toLowerCase() === newVar.talla.toLowerCase()
            )
        );

        if (newVariants.length === 0) {
            toast({ title: 'Sin cambios', description: 'Todas las combinaciones generadas ya existen.', variant: 'default' });
            return;
        }

        setFormData(prev => ({ ...prev, variants: [...existingVariants, ...newVariants] }));
        toast({ title: 'Éxito', description: `${newVariants.length} nuevas variantes han sido añadidas.` });
        setColorInput('');
        setTallaInput('');
    };

    const handleRemoveVariant = (index) => {
        setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };

    const allSubSKUsWithDetails = useMemo(() => {
        const baseSKU = formData.sku || 'SKU-BASE';
        if (!packConfig) return [];
        
        const subSkus = [];

        Object.entries(packConfig).forEach(([packKey, config]) => {
            if (config.type === 'assorted') {
                subSkus.push({
                    color: 'Surtido',
                    talla: 'N/A',
                    packName: config.name,
                    quantity: config.quantity,
                    subSku: `${baseSKU}-${packKey.toUpperCase()}-SURT`
                });
            }
        });

        const piecePackKey = Object.keys(packConfig).find(key => packConfig[key].type === 'piece');
        if (piecePackKey && formData.variants) {
            const pieceConfig = packConfig[piecePackKey];
            formData.variants.forEach(variant => {
                const colorCode = variant.color ? `-${variant.color.toUpperCase().replace(/\s/g, '')}` : '';
                const tallaCode = variant.talla ? `-${variant.talla.toUpperCase().replace(/\s/g, '')}` : '';
                subSkus.push({
                    color: variant.color || 'N/A',
                    talla: variant.talla || 'N/A',
                    packName: pieceConfig.name,
                    quantity: pieceConfig.quantity,
                    subSku: `${baseSKU}${colorCode}${tallaCode}-${piecePackKey.toUpperCase()}`
                });
            });
        }
        
        return subSkus;
    }, [formData.sku, formData.variants, packConfig]);

    const handlePrintLabels = () => {
        if (allSubSKUsWithDetails.length === 0) {
            toast({ title: 'No hay etiquetas para imprimir.', variant: 'destructive' });
            return;
        }

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const canvas = document.createElement('canvas');

        allSubSKUsWithDetails.forEach((item, index) => {
            try {
                JsBarcode(canvas, item.subSku, {
                    format: 'CODE128',
                    displayValue: true,
                    fontSize: 18,
                    margin: 10,
                });
                const barcodeDataUrl = canvas.toDataURL('image/png');
                
                const yPos = 10 + (index * 40);
                if(yPos > 280) {
                    doc.addPage();
                    index = 0;
                }
                
                doc.text(`${formData.nombre} (${item.packName})`, 10, yPos);
                doc.addImage(barcodeDataUrl, 'PNG', 10, yPos + 2, 80, 20);

            } catch (e) {
                console.error(`Failed to generate barcode for ${item.subSku}`, e);
                toast({ title: 'Error de Código de Barras', description: `No se pudo generar el código para ${item.subSku}.`, variant: 'destructive'});
            }
        });

        doc.save(`etiquetas_${formData.sku || 'producto'}.pdf`);
        toast({ title: 'PDF generado', description: 'Se ha descargado el archivo con las etiquetas.' });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración de Empaques</CardTitle>
                        <CardDescription>Define la cantidad y el tipo de empaque (pieza individual o surtido).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(packConfig).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-12 gap-2 items-center">
                                <Input 
                                    value={value.name} 
                                    onChange={(e) => handlePackConfigChange(key, 'name', e.target.value)}
                                    placeholder="Nombre"
                                    className="col-span-4"
                                />
                                 <Select value={value.type} onValueChange={(val) => handlePackConfigChange(key, 'type', val)}>
                                    <SelectTrigger className="col-span-4">
                                        <SelectValue placeholder="Tipo"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="piece"><Package className="inline-block mr-2 h-4 w-4"/> Pieza Individual</SelectItem>
                                        <SelectItem value="assorted"><Boxes className="inline-block mr-2 h-4 w-4"/> Paquete Surtido</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={value.quantity}
                                    onChange={(e) => handlePackConfigChange(key, 'quantity', e.target.value)}
                                    placeholder="Cant."
                                    className="col-span-4 text-center font-bold"
                                    required
                                    min="1"
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Generador de Variantes (para Piezas)</CardTitle>
                        <CardDescription>Ingresa colores y tallas separados por comas para generar combinaciones.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="colors">Colores</Label>
                            <Textarea id="colors" value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Rojo, Azul, Negro, ..."/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tallas">Tallas</Label>
                            <Textarea id="tallas" value={tallaInput} onChange={e => setTallaInput(e.target.value)} placeholder="S, M, L, XL, ..."/>
                        </div>
                        <Button onClick={handleGenerateCombinations} className="w-full"><Wand2 className="mr-2 h-4 w-4"/> Generar Combinaciones</Button>
                        
                        <div className="space-y-2 pt-4 border-t">
                            <h4 className="font-medium">Variantes Creadas</h4>
                            {formData.variants?.length > 0 ? (
                                <ul className="space-y-2 max-h-48 overflow-y-auto">
                                    {formData.variants.map((v, i) => (
                                        <li key={i} className="flex items-center justify-between bg-muted p-2 rounded-md">
                                            <span className="font-mono text-sm">Color: {v.color || 'N/A'}, Talla: {v.talla || 'N/A'}</span>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveVariant(i)}><Trash2 className="h-4 w-4" /></Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Aún no hay variantes de pieza.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Códigos de Barra (Sub-SKUs)</CardTitle>
                        <CardDescription>Códigos generados para cada variante y tipo de empaque.</CardDescription>
                    </div>
                    <Button onClick={handlePrintLabels} disabled={allSubSKUsWithDetails.length === 0}><Printer className="mr-2 h-4 w-4"/> Exportar Etiquetas</Button>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Palette className="inline-block mr-1 h-4 w-4"/>Color</TableHead>
                                    <TableHead><Scale className="inline-block mr-1 h-4 w-4"/>Talla</TableHead>
                                    <TableHead><Package className="inline-block mr-1 h-4 w-4"/>Empaque</TableHead>
                                    <TableHead className="text-center"><Hash className="inline-block mr-1 h-4 w-4"/>Cantidad</TableHead>
                                    <TableHead>Sub-SKU</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allSubSKUsWithDetails.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.color}</TableCell>
                                        <TableCell>{item.talla}</TableCell>
                                        <TableCell>{item.packName}</TableCell>
                                        <TableCell className="font-bold text-center">{item.quantity}</TableCell>
                                        <TableCell className="font-mono">{item.subSku}</TableCell>
                                    </TableRow>
                                ))}
                                {allSubSKUsWithDetails.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">Configure empaques y variantes para generar SKUs.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};