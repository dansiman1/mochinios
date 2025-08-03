import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getMovementTypeVariant = (type) => {
    switch (type) {
        case 'Entrada': return 'success';
        case 'Venta': return 'destructive';
        case 'Devolución': return 'warning';
        case 'Ajuste': return 'info';
        default: return 'secondary';
    }
};

export const HistoryTab = ({ product }) => {
    const movements = product.movimientos || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
                <CardDescription>Registro de todas las transacciones para este producto.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Notas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.length > 0 ? (
                            movements.map((mov, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(mov.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={getMovementTypeVariant(mov.tipo)}>{mov.tipo}</Badge>
                                    </TableCell>
                                    <TableCell className={`font-bold ${mov.tipo === 'Entrada' ? 'text-green-500' : 'text-red-500'}`}>
                                        {mov.tipo === 'Entrada' ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                                    </TableCell>
                                    <TableCell>{mov.usuario}</TableCell>
                                    <TableCell>{mov.notas}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="5" className="h-24 text-center">
                                    No hay movimientos registrados para este producto.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};