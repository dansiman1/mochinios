import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Shield, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ROLES, PERMISSIONS_CONFIG, generateInitialPermissions } from '@/lib/permissions';
import { Checkbox } from '@/components/ui/checkbox';

const generateRandomPin = () => Math.floor(1000 + Math.random() * 9000).toString();
const generateRandomToken = () => [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

const UserDetailModal = ({ isOpen, onClose, user, onSave }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                ...user,
                pin: user.pin || generateRandomPin(),
                token: user.token || generateRandomToken(),
                permissions: user.permissions || generateInitialPermissions(user.rol || ROLES.VENTAS),
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            rol: role,
            permissions: generateInitialPermissions(role),
        }));
    };

    const handlePermissionChange = (module, action, checked) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: {
                    ...prev.permissions[module],
                    [action]: checked,
                },
            },
        }));
    };

    const handleSave = () => {
        if (!formData.nombre || !formData.correo || !formData.rol) {
            toast({ title: "Error", description: "Nombre, correo y rol son obligatorios.", variant: "destructive" });
            return;
        }
        onSave(formData);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado", description: "El texto ha sido copiado al portapapeles." });
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[90%] h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{user.id ? `Editar Usuario: ${user.nombre}` : 'Crear Nuevo Usuario'}</DialogTitle>
                    <DialogDescription>Gestiona la información, rol y permisos del usuario.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-hidden py-4">
                    <Tabs defaultValue="info" className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info"><User className="mr-2 h-4 w-4" />Información General</TabsTrigger>
                            <TabsTrigger value="permissions"><Shield className="mr-2 h-4 w-4" />Permisos</TabsTrigger>
                            <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Seguridad</TabsTrigger>
                        </TabsList>
                        <div className="flex-grow overflow-y-auto mt-4 pr-4">
                            <TabsContent value="info" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre Completo</Label>
                                        <Input id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="correo">Correo Electrónico</Label>
                                        <Input id="correo" name="correo" type="email" value={formData.correo || ''} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono</Label>
                                        <Input id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rol">Rol</Label>
                                        <Select value={formData.rol || ''} onValueChange={handleRoleChange}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar rol..." /></SelectTrigger>
                                            <SelectContent>
                                                {Object.values(ROLES).map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Input id="password" name="password" type="password" placeholder="Dejar en blanco para no cambiar" onChange={handleChange} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="estado" checked={formData.estado === 'Activo'} onCheckedChange={checked => handleChange({ target: { name: 'estado', value: checked ? 'Activo' : 'Inactivo' } })} />
                                        <Label htmlFor="estado">Usuario {formData.estado === 'Activo' ? 'Activo' : 'Inactivo'}</Label>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="permissions">
                                <div className="space-y-4">
                                    {Object.entries(PERMISSIONS_CONFIG).map(([moduleKey, moduleConfig]) => (
                                        <div key={moduleKey} className="border p-4 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-3">{moduleConfig.label}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(moduleConfig.actions).map(([actionKey, actionLabel]) => (
                                                    <div key={actionKey} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${moduleKey}-${actionKey}`}
                                                            checked={!!formData.permissions?.[moduleKey]?.[actionKey]}
                                                            onCheckedChange={(checked) => handlePermissionChange(moduleKey, actionKey, checked)}
                                                        />
                                                        <label htmlFor={`${moduleKey}-${actionKey}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {actionLabel}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="security" className="space-y-6">
                                <div className="space-y-2">
                                    <Label>PIN de 4 dígitos</Label>
                                    <div className="flex items-center gap-2">
                                        <Input value={formData.pin || ''} readOnly className="font-mono text-lg tracking-widest" />
                                        <Button variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, pin: generateRandomPin() }))}><RefreshCw className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(formData.pin)}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Para desbloquear acciones restringidas.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Token de Seguridad</Label>
                                    <div className="flex items-center gap-2">
                                        <Input value={formData.token || ''} readOnly className="font-mono text-sm" />
                                        <Button variant="outline" size="icon" onClick={() => setFormData(p => ({ ...p, token: generateRandomToken() }))}><RefreshCw className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(formData.token)}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Para futuras integraciones con API.</p>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
                <DialogFooter className="mt-auto pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailModal;