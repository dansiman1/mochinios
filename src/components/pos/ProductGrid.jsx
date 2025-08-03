import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Barcode, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onAddToCart, getPrice }) => {
    const handleProductClick = () => {
        if (product.subSkus && product.subSkus.length > 0) {
            const pieceSku = product.subSkus.find(s => s.pack === 'p1');
            if (pieceSku) {
                onAddToCart(product, pieceSku);
            } else {
                onAddToCart(product, product.subSkus[0]); 
            }
        }
    };
    
    return (
      <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
        <Card onClick={handleProductClick} className="cursor-pointer group flex flex-col h-full glass-effect overflow-hidden rounded-xl">
          <div className="aspect-square w-full bg-muted/50 overflow-hidden flex items-center justify-center">
              {product.imageUrl ? 
                  <img src={product.imageUrl} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
              }
          </div>
          <CardContent className="p-3 flex-grow flex flex-col justify-between">
            <div>
              <p className="font-semibold leading-tight line-clamp-2">{product.nombre}</p>
              <Badge variant={product.existencias > 5 ? "success" : "warning"} className="mt-1">Stock: {product.existencias}</Badge>
            </div>
            <p className="text-lg font-bold text-primary mt-2">${getPrice(product, 'p1').toFixed(2)}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
};

export const ProductGrid = ({ products, onSearch, searchValue, onBarcodeScan, onAddToCart, getPrice }) => {
    const [barcodeScan, setBarcodeScan] = useState('');
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onBarcodeScan(barcodeScan)) {
                setBarcodeScan('');
            }
        }
    };

    return (
        <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col overflow-hidden glass-effect rounded-xl p-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Buscar producto..." className="pl-10 h-12 text-lg bg-background/70 rounded-lg" value={searchValue} onChange={e => onSearch(e.target.value)} />
              </div>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Escanear SKU" className="pl-10 h-12 text-lg w-48 bg-background/70 rounded-lg" value={barcodeScan} onChange={e => setBarcodeScan(e.target.value)} onKeyDown={handleKeyDown} />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} getPrice={getPrice} />
                ))}
              </div>
            </div>
        </div>
    );
};