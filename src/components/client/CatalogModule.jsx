import React, { useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileImage as ImageIcon } from 'lucide-react';

const CatalogModule = () => {
  const { crud } = useData();
  const { items: products } = crud('inventario');

  const availableProducts = useMemo(() => {
    return products.filter(p => p.existencias > 0);
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {availableProducts.length > 0 ? availableProducts.map(product => {
        const hasStock = product.existencias > 0;
        return (
          <Card key={product.id} className="overflow-hidden group">
            <div className="aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.nombre} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <ImageIcon className="w-24 h-24 text-muted-foreground" />
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-md leading-tight truncate pr-2">{product.nombre}</h3>
                <Badge variant={hasStock ? 'success' : 'secondary'}>
                  {hasStock ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="font-bold text-lg">${(product.precios?.p1 || 0).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        );
      }) : (
        <div className="col-span-full text-center py-16 text-muted-foreground">
          <p>No hay productos disponibles en el catálogo en este momento.</p>
        </div>
      )}
    </div>
  );
};

export default CatalogModule;