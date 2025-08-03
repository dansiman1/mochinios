import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AttendanceDetailModal from './modals/AttendanceDetailModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

const AttendanceTab = () => {
    const { crud } = useData();
    const { items: employees } = crud('empleados');
    const { items: allAttendances, refreshData } = crud('asistencias');

    const [attendances, setAttendances] = useState(allAttendances);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        setAttendances(allAttendances);
    }, [allAttendances]);

    const recordsForSelectedDate = useMemo(() => {
        return attendances
            .filter(a => moment(a.fecha).isSame(selectedDate, 'day'))
            .map(a => ({
                ...a,
                employeeName: employees.find(e => e.id === a.empleado_id)?.nombre || 'Desconocido'
            }))
            .sort((a, b) => (a.hora_entrada || '').localeCompare(b.hora_entrada || ''));
    }, [selectedDate, attendances, employees]);
    
    const handleAddNewAttendance = () => {
        const newEvent = {
            fecha: moment(selectedDate).format('YYYY-MM-DD'),
            tipo: 'Asistencia',
            hora_entrada: '',
            hora_salida: '',
            notas: ''
        };
        setSelectedEvent(newEvent);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
        refreshData(); 
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const CustomToolbar = (toolbar) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };

        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };

        const goToCurrent = () => {
            toolbar.onNavigate('TODAY');
        };

        return (
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <Button onClick={goToBack}>Ant</Button>
                    <Button onClick={goToCurrent}>Hoy</Button>
                    <Button onClick={goToNext}>Sig</Button>
                </div>
                <h3 className="text-xl font-bold capitalize">{toolbar.label}</h3>
                <Button onClick={handleAddNewAttendance}><PlusCircle className="mr-2 h-4 w-4" /> Registrar Asistencia</Button>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Calendario de Asistencia</CardTitle>
                        <CardDescription>Selecciona un día para ver o registrar asistencias.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[600px] bg-background p-4 rounded-md">
                            <Calendar
                                localizer={localizer}
                                events={[]}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: '100%' }}
                                selectable
                                onSelectSlot={(slotInfo) => handleDateChange(slotInfo.start)}
                                onNavigate={date => handleDateChange(date)}
                                date={selectedDate}
                                views={['month']}
                                components={{
                                    toolbar: CustomToolbar
                                }}
                                messages={{
                                    today: "Hoy",
                                    month: "Mes",
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Registros del Día</CardTitle>
                        <CardDescription>{moment(selectedDate).format('LL')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[550px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead>Entrada</TableHead>
                                        <TableHead>Salida</TableHead>
                                        <TableHead>Tipo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recordsForSelectedDate.length > 0 ? recordsForSelectedDate.map(rec => (
                                        <TableRow key={rec.id}>
                                            <TableCell>{rec.employeeName}</TableCell>
                                            <TableCell>{rec.hora_entrada || '-'}</TableCell>
                                            <TableCell>{rec.hora_salida || '-'}</TableCell>
                                            <TableCell><Badge variant={rec.tipo === 'Asistencia' ? 'success' : rec.tipo === 'Falta' ? 'destructive' : 'warning'}>{rec.tipo}</Badge></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan="4" className="h-24 text-center">No hay registros para este día.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {isModalOpen && (
                <AttendanceDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    eventData={selectedEvent}
                />
            )}
        </>
    );
};

export default AttendanceTab;