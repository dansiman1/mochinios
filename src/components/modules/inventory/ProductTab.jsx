import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOW_STOCK_THRESHOLD = 10;

const getStatusInfo = (existencias) => {
    if (existencias > LOW_STOCK_THRESHOLD) return { label: 'Disponible', variant: 'success' };
    if (existencias > 0 && existencias <= LOW_STOCK_THRESHOLD) return { label: 'Bajo', variant: 'warning' };
    if (existencias === 0) return { label: 'Sin Existencias', variant: 'destructive' };
    return { label: 'Descontinuado', variant: 'secondary' };
};

const ProductTab = () => {
    const { crud } = useData();
    const navigate = useNavigate();
    const { items: products } = crud('inventario');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    const handleNewPurchase = () => {
        navigate('/module/finanzas', { state: { defaultTab: 'cxp', openNewPayable: true } });
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.nombre.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))
        ), [products, productSearchTerm]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Gestión de Stock</CardTitle>
                        <CardDescription>Visualiza el stock actual. El inventario se modifica mediante compras, ventas y traspasos.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por nombre o SKU..." className="pl-8 w-full" value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} />
                        </div>
                        <Button onClick={handleNewPurchase}><PlusCircle className="mr-2 h-4 w-4" /> Nueva Compra</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table className="responsive-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-center">Stock Bodega</TableHead>
                            <TableHead className="text-center">Stock Tienda</TableHead>
                            <TableHead className="text-center">Stock Oficina</TableHead>
                            <TableHead className="text-center">Stock Total</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length > 0 ? filteredProducts.map(p => {
                            const status = getStatusInfo(p.existencias);
                            return (
                                <TableRow key={p.id}>
                                    <TableCell data-label="Producto" className="font-medium flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                            {p.imageUrl ? 
                                                <img-replace src={p.imageUrl} alt={p.nombre} className="w-full h-full object-cover rounded-md" /> :
                                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                            }
                                        </div>
                                        <span className="truncate">{p.nombre}</span>
                                    </TableCell>
                                    <TableCell data-label="SKU">{p.sku}</TableCell>
                                    <TableCell data-label="Stock Bodega" className="text-center font-semibold">{p.stockPorAlmacen?.bodega || 0}</TableCell>
                                    <TableCell data-label="Stock Tienda" className="text-center font-semibold">{p.stockPorAlmacen?.tienda || 0}</TableCell>
                                    <TableCell data-label="Stock Oficina" className="text-center font-semibold">{p.stockPorAlmacen?.oficina || 0}</TableCell>
                                    <TableCell data-label="Stock Total" className="text-center font-bold text-lg">{p.existencias || 0}</TableCell>
                                    <TableCell data-label="Estado"><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                                </TableRow>
                            );
                        }) : <TableRow><TableCell colSpan="7" className="h-24 text-center">No se encontraron productos.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ProductTab;