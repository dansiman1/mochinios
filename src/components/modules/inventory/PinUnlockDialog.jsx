import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const PinUnlockDialog = ({ isOpen, onClose, onUnlock }) => {
    const [pin, setPin] = useState('');
    const { toast } = useToast();
    const { requestPinAuth } = useAuth();

    const handleUnlockAttempt = () => {
        if (requestPinAuth(pin)) {
            onUnlock();
        } else {
            toast({ title: "❌ PIN Incorrecto", description: "El PIN no es válido o el usuario no tiene permisos.", variant: "destructive" });
        }
        setPin('');
    };

    const handlePinChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 4) {
            setPin(value);
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleUnlockAttempt();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Desbloqueo de Seguridad</DialogTitle>
                    <DialogDescription>
                        Ingresa el PIN de un usuario autorizado para continuar.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        type="password"
                        placeholder="••••"
                        maxLength="4"
                        value={pin}
                        onChange={handlePinChange}
                        onKeyDown={handleKeyDown}
                        className="text-center text-2xl tracking-[1rem] font-bold h-16"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleUnlockAttempt}>Desbloquear</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};