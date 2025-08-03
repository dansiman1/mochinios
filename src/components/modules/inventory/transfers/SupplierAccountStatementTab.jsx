import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SupplierAccountStatementTab = ({ supplier }) => {
    const { crud } = useData();
    const { items: allPurchases } = crud('cxp');

    const statementData = useMemo(() => {
        if (!supplier) return { purchases: [], totalPurchased: 0, totalPaid: 0, balance: 0 };
        
        const supplierPurchases = allPurchases.filter(p => p.proveedorId === supplier.id);
        const totalPurchased = supplierPurchases.reduce((acc, p) => acc + p.montoTotal, 0);
        const totalPaid = supplierPurchases.reduce((acc, p) => acc + (p.montoTotal - p.saldoPendiente), 0);
        const balance = totalPurchased - totalPaid;

        return { purchases: supplierPurchases, totalPurchased, totalPaid, balance };
    }, [supplier, allPurchases]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text(`Estado de Cuenta - ${supplier.nombre}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 30);
        
        const tableColumn = ["Factura ID", "Fecha Emisión", "Fecha Venc.", "Monto Total", "Saldo Pendiente", "Estado"];
        const tableRows = [];

        statementData.purchases.forEach(item => {
            tableRows.push([
                item.facturaId,
                format(parseISO(item.fechaEmision), 'dd/MM/yyyy'),
                format(parseISO(item.fechaVencimiento), 'dd/MM/yyyy'),
                `$${item.montoTotal.toFixed(2)}`,
                `$${item.saldoPendiente.toFixed(2)}`,
                item.estado
            ]);
        });

        doc.autoTable({
            startY: 40,
            head: [tableColumn],
            body: tableRows,
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.text(`Total Comprado: $${statementData.totalPurchased.toFixed(2)}`, 14, finalY + 10);
        doc.text(`Total Pagado: $${statementData.totalPaid.toFixed(2)}`, 14, finalY + 17);
        doc.setFont('helvetica', 'bold');
        doc.text(`Saldo Pendiente Total: $${statementData.balance.toFixed(2)}`, 14, finalY + 24);
        
        doc.save(`estado_cuenta_${supplier.nombre.replace(/\s/g, '_')}.pdf`);
    };

    if (!supplier) return null;

    return (
        <div className="space-y-6 p-4">
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle>Estado de Cuenta del Proveedor</CardTitle>
                        <CardDescription>Resumen de compras y pagos.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Factura ID</TableHead>
                                <TableHead>Fecha Emisión</TableHead>
                                <TableHead>Monto Total</TableHead>
                                <TableHead>Saldo Pendiente</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statementData.purchases.length > 0 ? statementData.purchases.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>#{p.facturaId}</TableCell>
                                    <TableCell>{format(parseISO(p.fechaEmision), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>${p.montoTotal.toFixed(2)}</TableCell>
                                    <TableCell className="font-semibold">${p.saldoPendiente.toFixed(2)}</TableCell>
                                    <TableCell><Badge variant={p.estado === 'Pagado' ? 'success' : (p.estado === 'Parcial' ? 'warning' : 'secondary')}>{p.estado}</Badge></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan="5" className="h-24 text-center">No hay compras registradas para este proveedor.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2 text-right">
                        <div className="flex justify-between"><span>Total Comprado:</span><span className="font-semibold">${statementData.totalPurchased.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Total Pagado:</span><span className="font-semibold text-green-500">${statementData.totalPaid.toFixed(2)}</span></div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-bold text-lg">Saldo Pendiente:</span>
                            <span className="font-bold text-lg text-destructive">${statementData.balance.toFixed(2)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SupplierAccountStatementTab;