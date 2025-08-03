import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

export const TicketDialog = ({ lastSale, onClose }) => {
    
    const generateTicket = () => {
        if (!lastSale) return;

        const doc = new jsPDF();
        const tableColumn = ["Producto", "Cant. Emp.", "Pz/Emp", "Precio Pz.", "Subtotal"];
        const tableRows = [];

        lastSale.productos.forEach(item => {
            const subtotal = (item.precioUnitario * item.piezasPorUnidad * item.cantidad).toFixed(2);
            const packName = item.nombre.match(/\(([^)]+)\)/)?.[1] || 'Pieza';
            const rowData = [
                item.nombre.replace(/\s\([^)]+\)/, ` (${packName})`),
                item.cantidad,
                item.piezasPorUnidad,
                `$${item.precioUnitario.toFixed(2)}`,
                `$${subtotal}`
            ];
            tableRows.push(rowData);
        });

        doc.setFontSize(22);
        doc.text("MochiniOS", 14, 22);
        doc.setFontSize(12);
        doc.text(`Ticket de Venta #${lastSale.id.toString().slice(-6)}`, 14, 30);
        doc.text(`Fecha: ${new Date(lastSale.fecha).toLocaleString()}`, 14, 36);
        doc.text(`Cliente: ${lastSale.client?.nombre || 'General'}`, 14, 42);
        doc.text(`Método de Pago: ${lastSale.metodoPago}`, 14, 48);

        doc.autoTable({
            startY: 55,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped'
        });
        
        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: $${lastSale.total.toFixed(2)}`, 14, finalY + 10);
        
        try {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, lastSale.id.toString(), {format: "CODE128", displayValue: false});
            const barcodeDataUrl = canvas.toDataURL('image/png');
            doc.addImage(barcodeDataUrl, 'PNG', 150, finalY + 5, 45, 10);
        } catch (e) {
            console.error("Failed to generate sale barcode", e);
        }

        doc.save(`ticket_${lastSale.id}.pdf`);
        onClose();
    };
    
    return (
        <AlertDialog open={!!lastSale} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Venta Completada</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Desea generar e imprimir el ticket para esta venta?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>No, gracias</AlertDialogCancel>
                    <AlertDialogAction onClick={generateTicket} className="gap-2">
                        <Printer className="w-4 h-4" /> Sí, generar ticket
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};