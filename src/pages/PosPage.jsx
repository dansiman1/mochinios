import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { PosHeader } from '@/components/pos/PosHeader';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { TicketDialog } from '@/components/pos/TicketDialog';
import { useAuth } from '@/hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};
const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

const PosPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { crud } = useData();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const posWarehouse = 'tienda';

  const { items: products, updateItem: updateProduct, getItemById } = crud('inventario');
  const { items: clients } = crud('clientes');
  const { addItem: addOrder } = crud('pedidos');

  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const getPrice = useCallback((product, packKey) => {
    if (!product || !product.precios) return 0;
    const priceListId = selectedClient?.priceList || packKey || 'p1';
    return product.precios[priceListId] || product.precios['p1'] || 0;
  }, [selectedClient]);

  const updateQuantity = useCallback((cartId, newQuantity) => {
    setCart(currentCart => {
      const cartItem = currentCart.find(item => item.cartId === cartId);
      if (!cartItem) return currentCart;

      if (newQuantity <= 0) {
        return currentCart.filter(item => item.cartId !== cartId);
      }
      
      const productInDB = products.find(p => p.id === cartItem.id);
      if(!productInDB) return currentCart;

      const totalPiecesRequired = newQuantity * cartItem.piecesPerUnit;
      const stockInWarehouse = productInDB.stockPorAlmacen[posWarehouse] || 0;

      if (totalPiecesRequired > stockInWarehouse) {
        toast({ title: `Stock insuficiente en ${posWarehouse}. Máximo ${Math.floor(stockInWarehouse / cartItem.piecesPerUnit)} unidades.`, variant: "destructive" });
        return currentCart;
      }
      
      return currentCart.map(item => 
        item.cartId === cartId ? { ...item, quantity: newQuantity, totalPieces: totalPiecesRequired } : item
      );
    });
  }, [products, toast, posWarehouse]);

  const addToCart = useCallback((product, subSkuInfo) => {
    const piecesPerUnit = subSkuInfo ? subSkuInfo.quantity : 1;
    const stockInWarehouse = product.stockPorAlmacen[posWarehouse] || 0;

    if (stockInWarehouse < piecesPerUnit) {
      toast({ title: `Stock insuficiente en ${posWarehouse}`, description: "No hay piezas disponibles de este producto.", variant: "destructive" });
      return;
    }

    const cartId = subSkuInfo ? subSkuInfo.subSku : product.sku;
    const existingItem = cart.find(item => item.cartId === cartId);

    if (existingItem) {
      updateQuantity(cartId, existingItem.quantity + 1);
    } else {
        const pricePerPiece = getPrice(product, subSkuInfo?.pack);
        const name = subSkuInfo 
          ? `${product.nombre} (${subSkuInfo.packName})`
          : product.nombre;
        
        setCart(prev => [...prev, { 
            ...product, 
            cartId, 
            name, 
            quantity: 1,
            piecesPerUnit,
            totalPieces: piecesPerUnit,
            price: pricePerPiece,
            subSkuInfo,
        }]);
    }
  }, [cart, getPrice, toast, updateQuantity, posWarehouse]);

  const handleBarcodeScan = useCallback((barcode) => {
    if (!barcode) return;
    for (const p of products) {
        if(p.subSkus) {
            const subSkuInfo = p.subSkus.find(sub => sub.subSku === barcode);
            if (subSkuInfo) {
                const fullSubSkuInfo = {
                    ...subSkuInfo,
                    packName: p.packConfig[subSkuInfo.pack]?.name || subSkuInfo.variant.color,
                };
                addToCart(p, fullSubSkuInfo);
                toast({ title: `Añadido: ${p.nombre} (${fullSubSkuInfo.packName})` });
                return true;
            }
        }
    }
    toast({ title: "Producto o variante no encontrado", variant: "destructive" });
    return false;
  }, [products, addToCart, toast]);
  
  const handleRfidScan = useCallback(() => {
    toast({
        title: "📡 Escaneo RFID Simulado",
        description: "Se agregaron productos de demostración al carrito.",
    });
    const rfidProducts = products.slice(0, 3);
    rfidProducts.forEach(p => {
        if(p && p.subSkus && p.subSkus.length > 0) {
            const pieceSku = p.subSkus.find(s => s.pack === 'p1');
            if (pieceSku) addToCart(p, pieceSku);
            else addToCart(p, p.subSkus[0]);
        }
    });
  }, [products, addToCart, toast]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products.filter(p => (p.stockPorAlmacen[posWarehouse] || 0) > 0);
    return products.filter(p => p.nombre.toLowerCase().includes(productSearch.toLowerCase()) && (p.stockPorAlmacen[posWarehouse] || 0) > 0);
  }, [products, productSearch, posWarehouse]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.piecesPerUnit * item.quantity), 0);
  }, [cart]);

  const processPayment = useCallback((paymentMethod) => {
    let stockError = false;

    for (const item of cart) {
        const productFromDB = getItemById(item.id);
        const totalPiecesSold = item.piecesPerUnit * item.quantity;
        if (!productFromDB || (productFromDB.stockPorAlmacen[posWarehouse] || 0) < totalPiecesSold) {
            stockError = true;
            toast({ title: `Stock insuficiente para ${item.name}`, description: `Quedan ${productFromDB?.stockPorAlmacen[posWarehouse] || 0} piezas en ${posWarehouse}.`, variant: "destructive" });
            break; 
        }
    }

    if(stockError) return;

    cart.forEach(item => {
        const product = getItemById(item.id);
        if (product) {
            const totalPiecesSold = item.piecesPerUnit * item.quantity;
            
            const newStockPorAlmacen = {
                ...product.stockPorAlmacen,
                [posWarehouse]: (product.stockPorAlmacen[posWarehouse] || 0) - totalPiecesSold,
            };

            const newExistencias = Object.values(newStockPorAlmacen).reduce((sum, val) => sum + val, 0);

            const newMovimiento = {
                fecha: new Date().toISOString(),
                tipo: 'Venta',
                cantidad: totalPiecesSold,
                usuario: currentUser?.nombre || 'Sistema',
                notas: `Venta POS desde ${posWarehouse}: ${item.quantity} x ${item.name} (#${item.cartId})`
            };

            updateProduct(product.id, { 
                ...product, 
                existencias: newExistencias,
                stockPorAlmacen: newStockPorAlmacen,
                movimientos: [...(product.movimientos || []), newMovimiento],
            });
        }
    });

    const newOrder = {
      clienteId: selectedClient?.id || null,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Entregado',
      productos: cart.map(item => ({
        productoId: item.id,
        nombre: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        piezasPorUnidad: item.piecesPerUnit,
      })),
      total: cartTotal,
      metodoPago: paymentMethod
    };
    
    const savedOrder = addOrder(newOrder);
    setLastSale({ ...savedOrder, client: selectedClient });

    toast({ title: "✅ Venta completada", description: `Pago con ${paymentMethod}.` });
    setCart([]);
    setSelectedClient(null);
    setPaymentModalOpen(false);
  }, [cart, cartTotal, selectedClient, getItemById, updateProduct, addOrder, toast, currentUser, posWarehouse]);

  return (
    <>
      <Helmet>
        <title>POS - MochiniOS</title>
        <meta name="description" content="Punto de Venta para Mochini Couture." />
      </Helmet>
      <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="h-screen w-screen flex flex-col animated-background">
        <PosHeader 
            onBack={() => navigate('/dashboard')}
            onRfidScan={handleRfidScan}
            onLogout={() => navigate('/os')}
        />

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden p-4 gap-4">
          <ProductGrid
            products={filteredProducts}
            onSearch={setProductSearch}
            searchValue={productSearch}
            onBarcodeScan={handleBarcodeScan}
            onAddToCart={addToCart}
            getPrice={getPrice}
          />

          <CartPanel
            cart={cart}
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
            onUpdateQuantity={updateQuantity}
            cartTotal={cartTotal}
            onFinalizeSale={() => setPaymentModalOpen(true)}
          />
        </div>

        <PaymentModal
            isOpen={isPaymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            total={cartTotal}
            onProcessPayment={processPayment}
        />
        
        <TicketDialog
            lastSale={lastSale}
            onClose={() => setLastSale(null)}
        />
      </motion.div>
    </>
  );
};

export default PosPage;