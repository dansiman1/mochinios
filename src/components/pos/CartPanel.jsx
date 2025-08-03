import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { User, Trash2, Plus, Minus, ShoppingCart, Image as ImageIcon, Package } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity }) => {
  const lineSubtotal = item.price * item.piecesPerUnit * item.quantity;
  return (
    <div key={item.cartId} className="flex items-center gap-3 bg-background/30 p-2 rounded-lg border border-transparent hover:border-primary/50 transition-colors">
      <div className="w-16 h-16 rounded-md bg-muted/50 flex-shrink-0 flex items-center justify-center">
          {item.imageUrl ? 
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-md" /> :
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
          }
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.quantity} x ({item.piecesPerUnit} pz x ${item.price.toFixed(2)}) = <span className="font-bold">${lineSubtotal.toFixed(2)}</span>
        </p>
        <Badge variant="secondary" className="mt-1">
          <Package className="w-3 h-3 mr-1.5" />
          Total: {item.piecesPerUnit * item.quantity} piezas
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
        <span className="font-bold w-6 text-center">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
      </div>
      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onUpdateQuantity(item.cartId, 0)}><Trash2 className="h-4 w-4" /></Button>
    </div>
  );
};

const ClientSelector = ({ clients, selectedClient, onClientSelect }) => {
    const clientOptions = clients.map(c => ({ value: c.id, label: c.nombre }));
    const selectedPriceList = selectedClient ? (selectedClient.priceList || 'p1').toUpperCase() : null;

    return (
        <div className="flex-shrink-0 mb-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 text-lg justify-start bg-background/50 rounded-lg">
                        <User className="mr-3 h-5 w-5" />
                        {selectedClient ? selectedClient.nombre : 'Seleccionar Cliente'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 glass-effect">
                    <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                        <CommandGroup>
                            {clientOptions.map(option => (
                                <CommandItem key={option.value} onSelect={() => onClientSelect(clients.find(c => c.id === option.value))}>
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            {selectedPriceList && <Badge className="mt-2">{selectedPriceList} precios</Badge>}
        </div>
    );
};

export const CartPanel = ({ cart, clients, selectedClient, onClientSelect, onUpdateQuantity, cartTotal, onFinalizeSale }) => {
    return (
        <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col p-4 glass-effect rounded-xl">
            <ClientSelector clients={clients} selectedClient={selectedClient} onClientSelect={onClientSelect} />

            <div className="flex-grow overflow-y-auto -mr-4 pr-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="w-16 h-16 mb-4" />
                  <p>El carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => <CartItem key={item.cartId} item={item} onUpdateQuantity={onUpdateQuantity} />)
              )}
            </div>

            <div className="flex-shrink-0 pt-4 border-t border-border/20 mt-auto">
              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-2xl text-primary">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full h-16 text-xl mt-4" onClick={onFinalizeSale} disabled={cart.length === 0}>
                Cobrar
              </Button>
            </div>
        </div>
    );
}