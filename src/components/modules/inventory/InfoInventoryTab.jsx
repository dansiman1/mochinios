import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';


export const InfoInventoryTab = ({ formData, setFormData, isLocked }) => {
    const [imagePreview, setImagePreview] = useState(formData.imageUrl);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        setImagePreview(formData.imageUrl);
    }, [formData.imageUrl]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    title: "Imagen demasiado grande",
                    description: "Por favor, sube una imagen de menos de 2MB.",
                    variant: "destructive",
                });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImagePreview(base64String);
                setFormData(prev => ({ ...prev, imageUrl: base64String }));
                toast({
                    title: "Imagen cargada",
                    description: "La imagen del producto ha sido actualizada. No olvides guardar los cambios.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const totalStock = React.useMemo(() => {
        return Object.values(formData.stockPorAlmacen || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    }, [formData.stockPorAlmacen]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader><CardTitle>Imagen del Producto</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                            {imagePreview ? (
                                <img-replace src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-24 h-24 text-muted-foreground" />
                            )}
                        </div>
                        <Input 
                            id="image-upload" 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImageUpload} 
                        />
                        <Button 
                            variant="outline" 
                            className="w-full cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Upload className="mr-2 h-4 w-4" /> Subir Imagen
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre del Producto</Label>
                            <Input id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU Principal</Label>
                            <Input id="sku" name="sku" value={formData.sku || ''} onChange={handleChange} required placeholder="Ej: MOC-TSH-001"/>
                        </div>
                    </CardContent>
                </Card>
                {formData.id && (
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle>Inventario por Almacén</CardTitle>
                                <CardDescription>El stock solo se modifica mediante compras, ventas y traspasos.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Almacén</TableHead>
                                        <TableHead className="text-right">Stock Actual</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(formData.stockPorAlmacen || {}).map(([almacen, stock]) => (
                                        <TableRow key={almacen}>
                                            <TableCell className="font-medium capitalize">{almacen}</TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {stock}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Stock Total</TableHead>
                                        <TableHead className="text-right font-bold text-lg">{totalStock}</TableHead>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};