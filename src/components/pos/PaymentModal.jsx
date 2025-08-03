import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

export const PaymentModal = ({ isOpen, onOpenChange, total, onProcessPayment }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="glass-effect">
            <DialogHeader>
              <DialogTitle className="text-2xl">Finalizar Venta</DialogTitle>
              <DialogDescription>Total a pagar: <span className="font-bold text-primary text-xl">${total.toFixed(2)}</span></DialogDescription>
            </DialogHeader>
            <div className="py-4 grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="h-24 text-lg w-full" onClick={() => onProcessPayment('Efectivo')}>Efectivo</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="h-24 text-lg w-full" onClick={() => onProcessPayment('Tarjeta')}>Tarjeta</Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="h-24 text-lg w-full" onClick={() => onProcessPayment('Transferencia')}>Transferencia</Button>
              </motion.div>
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="h-24 text-lg w-full" onClick={() => onProcessPayment('Otro')}>Otro</Button>
              </motion.div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    );
};