import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, LogOut, ShoppingCart, Rss } from 'lucide-react';

export const PosHeader = ({ onBack, onRfidScan, onLogout }) => {
    return (
        <header className="flex-shrink-0 p-3 flex justify-between items-center border-b glass-effect m-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} variant="ghost" size="icon"><ArrowLeft className="w-6 h-6" /></Button>
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="w-7 h-7" />
              <h1 className="text-xl font-bold text-foreground hidden sm:block">Punto de Venta</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onRfidScan}><Rss className="w-5 h-5 mr-2"/> Escanear RFID</Button>
            <ThemeToggle />
            <Button onClick={onLogout} variant="ghost" size="sm"><LogOut className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Salir</span></Button>
          </div>
        </header>
    );
}