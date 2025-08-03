import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { useToast } from '@/components/ui/use-toast';
import { PRICE_LISTS } from '@/lib/constants';

const generateSubSKUs = (baseSKU, packConfig, variants) => {
    const subSkus = [];
    if (!baseSKU || !packConfig || !variants) return subSkus;

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
        variants.forEach(variant => {
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

export const CsvImportExport = ({ products, onImport }) => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);

    const handleExport = () => {
        const dataToExport = products.map(p => {
            const row = {
                sku: p.sku,
                nombre: p.nombre,
                imageUrl: p.imageUrl || '',
            };
            PRICE_LISTS.forEach(list => {
                row[`precio_${list.id}`] = p.precios?.[list.id] || 0;
            });
            Object.keys(p.stockPorAlmacen || {}).forEach(almacen => {
                row[`stock_${almacen}`] = p.stockPorAlmacen[almacen] || 0;
            });
            row['variantes_color'] = (p.variants || []).map(v => v.color).join('|');
            row['variantes_talla'] = (p.variants || []).map(v => v.talla).join('|');
            
            Object.keys(p.packConfig || {}).forEach(packKey => {
                row[`pack_${packKey}_name`] = p.packConfig[packKey].name;
                row[`pack_${packKey}_quantity`] = p.packConfig[packKey].quantity;
                row[`pack_${packKey}_type`] = p.packConfig[packKey].type;
            });

            return row;
        });

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'mochinios_inventario.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Exportación exitosa', description: 'El archivo CSV con los productos ha sido descargado.' });
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                let updatedCount = 0;
                let createdCount = 0;
                let errorCount = 0;
                
                const newProducts = [...products];

                results.data.forEach(row => {
                    if (!row.sku || !row.nombre) {
                        errorCount++;
                        return;
                    }

                    const precios = {};
                    PRICE_LISTS.forEach(list => {
                        precios[list.id] = parseFloat(row[`precio_${list.id}`]) || 0;
                    });

                    const stockPorAlmacen = {
                        oficina: parseInt(row.stock_oficina, 10) || 0,
                        bodega: parseInt(row.stock_bodega, 10) || 0,
                        tienda: parseInt(row.stock_tienda, 10) || 0,
                    };
                    
                    const existencias = Object.values(stockPorAlmacen).reduce((a, b) => a + b, 0);

                    const colors = (row.variantes_color || '').split('|').filter(Boolean);
                    const tallas = (row.variantes_talla || '').split('|').filter(Boolean);
                    const variants = colors.map((color, i) => ({ color, talla: tallas[i] || '' }));

                    const packConfig = {
                        p1: { name: row.pack_p1_name || 'Pieza', quantity: parseInt(row.pack_p1_quantity, 10) || 1, type: row.pack_p1_type || 'piece' },
                        p2: { name: row.pack_p2_name || 'Paquete', quantity: parseInt(row.pack_p2_quantity, 10) || 6, type: row.pack_p2_type || 'assorted' },
                        p3: { name: row.pack_p3_name || 'Caja', quantity: parseInt(row.pack_p3_quantity, 10) || 12, type: row.pack_p3_type || 'assorted' },
                    };

                    const subSkus = generateSubSKUs(row.sku, packConfig, variants);

                    const productData = {
                        sku: row.sku,
                        nombre: row.nombre,
                        imageUrl: row.imageUrl || '',
                        precios,
                        stockPorAlmacen,
                        existencias,
                        variants,
                        packConfig,
                        subSkus,
                        movimientos: [],
                    };

                    const existingProductIndex = newProducts.findIndex(p => p.sku === row.sku);
                    if (existingProductIndex !== -1) {
                        const existingProduct = newProducts[existingProductIndex];
                        newProducts[existingProductIndex] = { ...existingProduct, ...productData, id: existingProduct.id };
                        updatedCount++;
                    } else {
                        newProducts.push({ ...productData, id: new Date().getTime() + Math.random() });
                        createdCount++;
                    }
                });

                onImport(newProducts);
                toast({
                    title: 'Importación completada',
                    description: `${createdCount} productos creados, ${updatedCount} actualizados, ${errorCount} filas con errores.`,
                });
            },
            error: (error) => {
                toast({ title: 'Error al importar', description: error.message, variant: 'destructive' });
            }
        });
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleImport}
            />
            <Button variant="outline" onClick={() => fileInputRef.current.click()}>
                <Upload className="mr-2 h-4 w-4" /> Importar
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
        </>
    );
};