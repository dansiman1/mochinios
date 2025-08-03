import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

export const generatePayrollReceipt = (payroll, employee, bankAccount) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Recibo de Pago', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Emisión: ${moment().format('DD/MM/YYYY')}`, 20, 30);
    doc.text(`Folio de Pago: #${payroll.id}`, 190, 30, { align: 'right' });

    // Employee Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Empleado', 20, 50);
    doc.setLineWidth(0.5);
    doc.line(20, 52, 190, 52);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.autoTable({
        startY: 55,
        body: [
            ['Nombre:', employee?.nombre || 'N/A'],
            ['Puesto:', employee?.puesto || 'N/A'],
        ],
        theme: 'plain',
        styles: { fontSize: 12, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Payment Details
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Pago', 20, finalY);
    doc.line(20, finalY + 2, 190, finalY + 2);

    doc.autoTable({
        startY: finalY + 5,
        body: [
            ['Concepto:', payroll.concepto],
            ['Periodo de Pago:', `${moment(payroll.periodo_inicio).format('DD/MM/YYYY')} - ${moment(payroll.periodo_fin).format('DD/MM/YYYY')}`],
            ['Fecha de Pago:', moment(payroll.fecha_pago).format('DD/MM/YYYY')],
            ['Monto Neto Pagado:', `$${(payroll.monto_neto || 0).toFixed(2)} MXN`],
        ],
        theme: 'plain',
        styles: { fontSize: 12, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Footer & Signature
    const finalY2 = doc.lastAutoTable.finalY + 40;
    doc.setLineWidth(0.5);
    doc.line(50, finalY2, 160, finalY2);
    doc.setFontSize(12);
    doc.text('Firma del Empleado', 105, finalY2 + 5, { align: 'center' });
    doc.text('Recibí de conformidad la cantidad descrita en este documento.', 105, finalY2 + 15, { align: 'center' });

    doc.save(`recibo_pago_${employee?.nombre.replace(/\s+/g, '_')}_${payroll.id}.pdf`);
};