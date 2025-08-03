import React, { useState, useEffect } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const AttendanceDetailModal = ({ isOpen, onClose, eventData }) => {
    const { crud } = useData();
    const { items: employees } = crud('empleados');
    const { addItem, updateItem, refreshData } = crud('asistencias');
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        empleado_id: '',
        tipo: 'Asistencia',
        hora_entrada: '',
        hora_salida: '',
        notas: ''
    });

    useEffect(() => {
        if (eventData) {
            setFormData({
                empleado_id: eventData.empleado_id || '',
                tipo: eventData.tipo || 'Asistencia',
                hora_entrada: eventData.hora_entrada || '',
                hora_salida: eventData.hora_salida || '',
                notas: eventData.notas || ''
            });
        }
    }, [eventData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.empleado_id) {
            toast({
                title: "Error",
                description: "Por favor, selecciona un empleado.",
                variant: "destructive"
            });
            return;
        }

        const dataToSave = {
            ...eventData,
            ...formData,
            empleado_id: parseInt(formData.empleado_id),
        };

        if (eventData?.id) {
            updateItem(eventData.id, dataToSave);
            toast({ title: "✅ Asistencia Actualizada" });
        } else {
            addItem(dataToSave);
            toast({ title: "✅ Asistencia Registrada" });
        }
        refreshData();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Detalle de Asistencia</DialogTitle>
                    <DialogDescription>
                        Registra o edita la asistencia para el día {eventData?.fecha}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="empleado_id" className="text-right">Empleado</Label>
                        <Select value={formData.empleado_id.toString()} onValueChange={(value) => handleSelectChange('empleado_id', value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tipo" className="text-right">Tipo</Label>
                        <Select value={formData.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Tipo de registro" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Asistencia">Asistencia</SelectItem>
                                <SelectItem value="Falta">Falta</SelectItem>
                                <SelectItem value="Retardo">Retardo</SelectItem>
                                <SelectItem value="Permiso">Permiso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hora_entrada" className="text-right">Entrada</Label>
                        <Input id="hora_entrada" type="time" value={formData.hora_entrada} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hora_salida" className="text-right">Salida</Label>
                        <Input id="hora_salida" type="time" value={formData.hora_salida} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notas" className="text-right">Notas</Label>
                        <Textarea id="notas" value={formData.notas} onChange={handleChange} className="col-span-3" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AttendanceDetailModal;