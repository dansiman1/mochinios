import React from 'react';

export const ORDER_STATUSES = [
    'Pendiente',
    'En Proceso',
    'Enviado',
    'Entregado',
    'Cancelado',
    'Devuelto'
];

export const getStatusInfo = (status) => {
    switch (status) {
        case 'Pendiente':
            return { label: 'Pendiente', variant: 'warning' };
        case 'En Proceso':
            return { label: 'En Proceso', variant: 'info' };
        case 'Enviado':
            return { label: 'Enviado', variant: 'shipping' };
        case 'Entregado':
            return { label: 'Entregado', variant: 'success' };
        case 'Cancelado':
            return { label: 'Cancelado', variant: 'destructive' };
        case 'Devuelto':
            return { label: 'Devuelto', variant: 'purple' };
        default:
            return { label: status, variant: 'secondary' };
    }
};