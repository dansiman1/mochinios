import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useData } from '@/hooks/useDataContext';
import { Users, Package, FileText, ShieldCheck as UserShield } from 'lucide-react';

export function GlobalSearch({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { crud } = useData();

  const { items: clients } = crud('clientes');
  const { items: products } = crud('inventario');
  const { items: orders } = crud('pedidos');
  const { items: users } = crud('usuarios');

  const runCommand = (command) => {
    setIsOpen(false);
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Busca clientes, productos, pedidos..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        <CommandGroup heading="Clientes">
          {clients.map((client) => (
            <CommandItem
              key={`client-${client.id}`}
              onSelect={() => runCommand(() => navigate('/module/clientes'))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>{client.nombre}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Productos">
          {products.map((product) => (
            <CommandItem
              key={`product-${product.id}`}
              onSelect={() => runCommand(() => navigate('/module/inventario'))}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>{product.nombre}</span>
              <span className="ml-auto text-xs text-muted-foreground">{product.sku}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Pedidos">
          {orders.map((order) => (
            <CommandItem
              key={`order-${order.id}`}
              onSelect={() => runCommand(() => navigate('/module/inventario', { state: { defaultTab: 'orders' } }))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Pedido #{order.id.toString().slice(-6)}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {clients.find(c => c.id === order.clienteId)?.nombre || 'N/A'}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandGroup heading="Usuarios">
          {users.map((user) => (
            <CommandItem
              key={`user-${user.id}`}
              onSelect={() => runCommand(() => navigate('/module/usuarios'))}
            >
              <UserShield className="mr-2 h-4 w-4" />
              <span>{user.nombre}</span>
              <span className="ml-auto text-xs text-muted-foreground">{user.rol}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}