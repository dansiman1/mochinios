import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Search, User, Mail, Phone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ClientDetailsModal } from './clients/ClientDetailsModal';
import { PRICE_LISTS } from '@/lib/constants';

const ClientModule = () => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: clients, deleteItem } = crud('clientes');

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddNew = () => {
        setSelectedClient(null);
        setModalOpen(true);
    };

    const handleEdit = (client) => {
        setSelectedClient(client);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedClient(null);
    };

    const handleDelete = (id) => {
        deleteItem(id);
        toast({ title: "🗑️ Cliente Eliminado", variant: "destructive" });
    };

    const filteredClients = useMemo(() =>
        clients.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.correo?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [clients, searchTerm]);
    
    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Clientes y Members Club</CardTitle>
                            <CardDescription>Administra la información de tus clientes y su membresía.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nombre o correo..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={handleAddNew} className="flex-shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cliente</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {filteredClients.length > 0 ? filteredClients.map(client => (
                            <div key={client.id} className="bg-card p-4 rounded-lg border shadow-sm flex items-center gap-4">
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                    {getInitials(client.nombre)}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <h3 className="font-semibold truncate text-base">{client.nombre}</h3>
                                    {client.correo && <p className="text-muted-foreground text-sm truncate flex items-center gap-1.5"><Mail className="h-3 w-3" />{client.correo}</p>}
                                    {client.telefono && <p className="text-muted-foreground text-sm truncate flex items-center gap-1.5"><Phone className="h-3 w-3" />{client.telefono}</p>}
                                </div>
                                <div className="flex-shrink-0">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(client)}><Edit className="mr-2 h-4 w-4" /> Ver / Editar</DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(client.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )) : <div className="h-24 text-center flex items-center justify-center text-muted-foreground">No se encontraron clientes.</div>}
                    </div>

                    {/* Desktop View */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Lista de Precios</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.length > 0 ? filteredClients.map(client => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.nombre}</TableCell>
                                    <TableCell>{client.correo}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.estado === 'Activo' ? 'success' : 'secondary'}>{client.estado}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {PRICE_LISTS.find(p => p.id === client.priceList)?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(client)}><Edit className="mr-2 h-4 w-4" /> Ver / Editar</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(client.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan="5" className="h-24 text-center">No se encontraron clientes.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {isModalOpen && (
                <ClientDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    client={selectedClient}
                />
            )}
        </>
    );
};

export default ClientModule;