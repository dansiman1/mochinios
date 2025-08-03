import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MyAccountModule = () => {
    const { currentClient, setCurrentClient } = useAuth();
    const { crud } = useData();
    const { updateItem: updateClient } = crud('clientes');
    const { toast } = useToast();
    const [formData, setFormData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (currentClient) {
            setFormData({
                nombre: currentClient.nombre,
                correo: currentClient.correo,
                telefono: currentClient.telefono || '',
            });
        }
    }, [currentClient]);
    
    if (!currentClient || !formData) {
        return <p>Cargando información de la cuenta...</p>;
    }
    
    // For admin test user
    if(currentClient.rol === 'Administrador') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mi Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Estás viendo como un cliente de prueba. Las funciones de edición de cuenta están desactivadas.</p>
                </CardContent>
            </Card>
        )
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = () => {
        updateClient(currentClient.id, formData);
        
        // Update currentClient in auth context as well
        const updatedClient = { ...currentClient, ...formData };
        setCurrentClient(updatedClient);
        sessionStorage.setItem('currentClient', JSON.stringify(updatedClient));

        toast({ title: '✅ Perfil Actualizado', description: 'Tu información ha sido guardada.' });
        setIsEditing(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Aquí puedes ver y editar tus datos personales.</CardDescription>
                        </div>
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>Editar</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre Completo</Label>
                        <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} disabled={!isEditing} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="correo">Correo Electrónico</Label>
                        <Input id="correo" name="correo" type="email" value={formData.correo} onChange={handleChange} disabled={!isEditing} />
                    </div>
                     <div className="space-y-1.5">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={!isEditing} />
                    </div>
                    {isEditing && (
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                    <CardDescription>Para mayor seguridad, te recomendamos cambiar tu contraseña periódicamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>Próximamente</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyAccountModule;