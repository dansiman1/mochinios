import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRICE_LISTS } from '@/lib/constants';

export const ClientForm = ({ onSave, onCancel, currentItem }) => {
    const [formData, setFormData] = useState(currentItem || { nombre: '', telefono: '', priceList: 'p1' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, priceList: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">Nombre</Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefono" className="text-right">Teléfono</Label>
                <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priceList" className="text-right">Lista de Precios</Label>
                <Select value={formData.priceList} onValueChange={handleSelectChange}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar lista" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRICE_LISTS.map(list => (
                            <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar Cliente</Button>
            </DialogFooter>
        </form>
    );
};