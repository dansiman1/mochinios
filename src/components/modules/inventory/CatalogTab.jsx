import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Image as ImageIcon, Edit, PlusCircle } from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { useToast } from '@/components/ui/use-toast';
import { PRICE_LISTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CsvImportExport } from './CsvImportExport';

const LOW_STOCK_THRESHOLD = 10;

const getStatusInfo = (existencias) => {
    if (existencias > LOW_STOCK_THRESHOLD) return { label: 'Disponible', variant: 'success' };
    if (existencias > 0 && existencias <= LOW_STOCK_THRESHOLD) return { label: 'Bajo', variant: 'warning' };
    if (existencias === 0) return { label: 'Sin Existencias', variant: 'destructive' };
    return { label: 'Descontinuado', variant: 'secondary' };
};

export const CatalogTab = () => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: products, updateItem: updateProduct, addItem: addProduct, setItems: setProducts } = crud('inventario');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const initializeNewProduct = () => {
        const initialPrices = PRICE_LISTS.reduce((acc, list) => ({ ...acc, [list.id]: 0 }), {});
        return { 
            nombre: '', 
            sku: '', 
            imageUrl: '', 
            precios: initialPrices,
            stockPorAlmacen: { oficina: 0, bodega: 0, tienda: 0 },
            existencias: 0,
            movimientos: [],
            variants: [],
            packConfig: {
                p1: { name: 'Pieza', quantity: 1, type: 'piece' },
                p2: { name: 'Paquete', quantity: 6, type: 'assorted' },
                p3: { name: 'Caja', quantity: 12, type: 'assorted' },
            }
        };
    };

    const handleAddNewProduct = () => {
        setCurrentProduct(initializeNewProduct());
        setModalOpen(true);
    };

    const handleEditProduct = (product) => {
        const initialPrices = PRICE_LISTS.reduce((acc, list) => ({ ...acc, [list.id]: product.precios?.[list.id] || 0 }), {});
        const stockPorAlmacen = product.stockPorAlmacen || { oficina: 0, bodega: 0, tienda: 0 };
        const packConfig = product.packConfig || {
            p1: { name: 'Pieza', quantity: 1, type: 'piece' },
            p2: { name: 'Paquete', quantity: 6, type: 'assorted' },
            p3: { name: 'Caja', quantity: 12, type: 'assorted' },
        };
        setCurrentProduct({ ...product, precios: initialPrices, stockPorAlmacen, packConfig, movimientos: product.movimientos || [], variants: product.variants || [] });
        setModalOpen(true);
    };

    const handleSaveProduct = (data) => {
        if (data.id) {
            updateProduct(data.id, data);
            toast({ title: "✅ Producto Actualizado" });
        } else {
            addProduct({ ...data, existencias: 0, stockPorAlmacen: { oficina: 0, bodega: 0, tienda: 0 } });
            toast({ title: "✅ Producto Creado" });
        }
        setModalOpen(false);
        setCurrentProduct(null);
    };

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [products, searchTerm]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Catálogo de Productos</CardTitle>
                            <CardDescription>Explora y gestiona las fichas de tus productos.</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                           <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nombre o SKU..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <CsvImportExport 
                                    products={products} 
                                    onImport={(newProducts) => setProducts(newProducts)}
                                />
                                <Button onClick={handleAddNewProduct}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Producto</Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredProducts.map(product => {
                            const status = getStatusInfo(product.existencias);
                            return (
                                <Card key={product.id} className="overflow-hidden group relative cursor-pointer" onClick={() => handleEditProduct(product)}>
                                    <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
                                        {product.imageUrl ? (
                                            <img-replace src={product.imageUrl} alt={product.nombre} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        ) : (
                                            <ImageIcon className="w-24 h-24 text-muted-foreground" />
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-md leading-tight truncate pr-2">{product.nombre}</h3>
                                            <Badge variant={status.variant} className="flex-shrink-0">{status.label}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="font-bold text-lg">${(product.precios?.p1 || 0).toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground">Stock: {product.existencias || 0}</p>
                                        </div>
                                    </CardContent>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No se encontraron productos que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {isModalOpen && (
                <ProductDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    product={currentProduct}
                    onSave={handleSaveProduct}
                />
            )}
        </>
    );
};