import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRICE_LISTS } from '@/lib/constants';

export const GeneralInfoTab = ({ currentClient, setClientData }) => {
    const [formData, setFormData] = useState(
        currentClient || {
            nombre: '', empresa: '', correo: '', telefono: '',
            estado: 'Activo', membresia: 'Bronce', priceList: 'p1', paymentMethod: 'Efectivo'
        }
    );

    useEffect(() => {
        if (currentClient) {
            setFormData(prev => ({...prev, ...currentClient}));
        }
    }, [currentClient]);

    useEffect(() => {
        setClientData(formData);
    }, [formData, setClientData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="empresa">Empresa (Opcional)</Label>
                    <Input id="empresa" name="empresa" value={formData.empresa || ''} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="correo">Correo Electrónico</Label>
                    <Input id="correo" name="correo" type="email" value={formData.correo || ''} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={formData.estado} onValueChange={(v) => handleSelectChange('estado', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="membresia">Nivel de Membresía</Label>
                    <Select value={formData.membresia} onValueChange={(v) => handleSelectChange('membresia', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pink">Pink</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="priceList">Lista de Precios Asignada</Label>
                    <Select value={formData.priceList} onValueChange={(v) => handleSelectChange('priceList', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {PRICE_LISTS.map(list => (
                                <SelectItem key={list.id} value={list.id}>{list.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="paymentMethod">Método de Pago Habitual</Label>
                    <Select value={formData.paymentMethod} onValueChange={(v) => handleSelectChange('paymentMethod', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};