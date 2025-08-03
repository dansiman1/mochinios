import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import UserDetailModal from './users/UserDetailModal';
import { ROLES, generateInitialPermissions } from '@/lib/permissions';

const UserManagementModule = () => {
    const { crud } = useData();
    const { items: users, addItem, updateItem, deleteItem, setItems } = crud('usuarios');
    const { toast } = useToast();

    const [isModalOpen, setModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!users || users.length === 0) {
            setItems([{ 
                id: 1, 
                nombre: 'Admin', 
                correo: 'admin@mochini.org', 
                telefono: 'N/A',
                rol: ROLES.ADMINISTRADOR, 
                estado: 'Activo',
                password: 'admin',
                pin: '1234',
                token: 'admin-token-placeholder',
                permissions: generateInitialPermissions(ROLES.ADMINISTRADOR)
            }]);
        }
    }, [users, setItems]);


    const handleAddNewUser = () => {
        setCurrentUser({
            nombre: '',
            correo: '',
            telefono: '',
            rol: ROLES.VENTAS,
            estado: 'Activo',
            password: '',
            permissions: generateInitialPermissions(ROLES.VENTAS)
        });
        setModalOpen(true);
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setModalOpen(true);
    };

    const handleSaveUser = (data) => {
        if (data.id) {
            updateItem(data.id, data);
            toast({ title: "✅ Usuario Actualizado" });
        } else {
            addItem(data);
            toast({ title: "✅ Usuario Creado" });
        }
        setModalOpen(false);
        setCurrentUser(null);
    };

    const handleDeleteUser = (id) => {
        if (users.length <= 1) {
            toast({ title: "Error", description: "No se puede eliminar el único usuario.", variant: "destructive" });
            return;
        }
        deleteItem(id);
        toast({ title: "🗑️ Usuario Eliminado", variant: "destructive" });
    };

    const filteredUsers = useMemo(() =>
        (users || []).filter(u =>
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.rol.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Usuarios, Roles y Permisos</CardTitle>
                            <CardDescription>Gestiona los accesos y permisos de los usuarios del sistema.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar usuario..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={handleAddNewUser} className="flex-shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table className="responsive-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell data-label="Nombre" className="font-medium">{user.nombre}</TableCell>
                                    <TableCell data-label="Correo">{user.correo}</TableCell>
                                    <TableCell data-label="Teléfono">{user.telefono}</TableCell>
                                    <TableCell data-label="Rol"><Badge variant="secondary">{user.rol}</Badge></TableCell>
                                    <TableCell data-label="Estado">
                                        <Badge variant={user.estado === 'Activo' ? 'success' : 'destructive'}>
                                            {user.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell data-label="Acciones" className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible y eliminará al usuario permanentemente.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan="6" className="h-24 text-center">No se encontraron usuarios.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {currentUser && (
                <UserDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    user={currentUser}
                    onSave={handleSaveUser}
                />
            )}
        </>
    );
};

export default UserManagementModule;