import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

const EmployeeFormModal = ({ isOpen, onClose, employee }) => {
    const { crud } = useData();
    const { addItem, updateItem } = crud('empleados');
    const { items: allAttendances } = crud('asistencias');
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        nombre: '',
        puesto: '',
        salario: '',
        fecha_contratacion: '',
        estado: 'Activo',
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                nombre: employee.nombre || '',
                puesto: employee.puesto || '',
                salario: employee.salario || '',
                fecha_contratacion: employee.fecha_contratacion || '',
                estado: employee.estado || 'Activo',
            });
        } else {
            setFormData({
                nombre: '',
                puesto: '',
                salario: '',
                fecha_contratacion: '',
                estado: 'Activo',
            });
        }
    }, [employee]);

    const employeeAttendances = useMemo(() => {
        if (!employee) return [];
        return allAttendances
            .filter(a => a.empleado_id === employee.id)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [allAttendances, employee]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            salario: parseFloat(formData.salario) || 0,
        };

        if (employee?.id) {
            updateItem(employee.id, dataToSave);
            toast({ title: "✅ Empleado Actualizado" });
        } else {
            addItem(dataToSave);
            toast({ title: "✅ Empleado Creado" });
        }
        onClose();
    };

    const handleExportCSV = () => {
        const dataToExport = employeeAttendances.map(a => ({
            fecha: a.fecha,
            tipo: a.tipo,
            hora_entrada: a.hora_entrada || 'N/A',
            hora_salida: a.hora_salida || 'N/A',
            notas: a.notas || ''
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `asistencias_${employee.nombre.replace(' ', '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Exportación exitosa', description: 'El archivo CSV ha sido descargado.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
                    <DialogDescription>
                        {employee ? 'Actualiza los detalles y consulta el historial del empleado.' : 'Añade un nuevo empleado a tu equipo.'}
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">Información General</TabsTrigger>
                        <TabsTrigger value="attendance" disabled={!employee}>Asistencias</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input id="nombre" value={formData.nombre} onChange={handleChange} required />
                                </div>
                                <div>
                                    <Label htmlFor="puesto">Puesto</Label>
                                    <Input id="puesto" value={formData.puesto} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label htmlFor="salario">Salario</Label>
                                    <Input id="salario" type="number" value={formData.salario} onChange={handleChange} />
                                </div>
                                <div>
                                    <Label htmlFor="fecha_contratacion">Fecha de Contratación</Label>
                                    <Input id="fecha_contratacion" type="date" value={formData.fecha_contratacion} onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select value={formData.estado} onValueChange={(value) => handleSelectChange('estado', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Activo">Activo</SelectItem>
                                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                                <Button type="submit">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                    <TabsContent value="attendance">
                        <div className="py-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Historial de Asistencias</h3>
                                <Button variant="outline" onClick={handleExportCSV}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar a CSV
                                </Button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Entrada</TableHead>
                                            <TableHead>Salida</TableHead>
                                            <TableHead>Notas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employeeAttendances.length > 0 ? employeeAttendances.map(att => (
                                            <TableRow key={att.id}>
                                                <TableCell>{att.fecha}</TableCell>
                                                <TableCell><Badge variant={att.tipo === 'Asistencia' ? 'success' : att.tipo === 'Falta' ? 'destructive' : 'warning'}>{att.tipo}</Badge></TableCell>
                                                <TableCell>{att.hora_entrada || 'N/A'}</TableCell>
                                                <TableCell>{att.hora_salida || 'N/A'}</TableCell>
                                                <TableCell>{att.notas || '-'}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan="5" className="text-center h-24">No hay registros de asistencia.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeFormModal;