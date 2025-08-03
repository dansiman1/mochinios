import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EmployeeFormModal from './modals/EmployeeFormModal';

const EmployeesTab = () => {
    const { crud } = useData();
    const { toast } = useToast();
    const { items: employees, deleteItem } = crud('empleados');

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddNew = () => {
        setSelectedEmployee(null);
        setModalOpen(true);
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleDelete = (id) => {
        deleteItem(id);
        toast({ title: "🗑️ Empleado Eliminado", variant: "destructive" });
    };

    const filteredEmployees = useMemo(() =>
        employees.filter(e =>
            e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.puesto && e.puesto.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [employees, searchTerm]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Gestión de Empleados</CardTitle>
                            <CardDescription>Administra la información de tu equipo.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nombre o puesto..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Empleado</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Puesto</TableHead>
                                <TableHead>Salario</TableHead>
                                <TableHead>Fecha de Contratación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.length > 0 ? filteredEmployees.map(employee => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.nombre}</TableCell>
                                    <TableCell>{employee.puesto}</TableCell>
                                    <TableCell>${(employee.salario || 0).toFixed(2)}</TableCell>
                                    <TableCell>{employee.fecha_contratacion}</TableCell>
                                    <TableCell>
                                        <Badge variant={employee.estado === 'Activo' ? 'success' : 'destructive'}>{employee.estado}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(employee)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(employee.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan="6" className="h-24 text-center">No se encontraron empleados.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {isModalOpen && (
                <EmployeeFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    employee={selectedEmployee}
                />
            )}
        </>
    );
};

export default EmployeesTab;