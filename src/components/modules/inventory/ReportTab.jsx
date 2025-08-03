import React, { useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LOW_STOCK_THRESHOLD = 5;

const ReportTab = () => {
    const { data } = useData();
    const products = data.mochinios_inventario || [];
    const orders = data.mochinios_pedidos || [];

    const reports = useMemo(() => {
        const totalProducts = products.length;
        const outOfStock = products.filter(p => Number(p.existencias) === 0).length;
        const lowStock = products.filter(p => Number(p.existencias) > 0 && Number(p.existencias) <= LOW_STOCK_THRESHOLD).length;
        
        const salesCount = orders.reduce((acc, order) => {
            if (order.estado !== 'Cancelado') {
                order.productos.forEach(p => {
                    acc[p.productoId] = (acc[p.productoId] || 0) + Number(p.cantidad);
                });
            }
            return acc;
        }, {});

        const bestSellers = Object.entries(salesCount)
            .map(([productoId, count]) => {
                const product = products.find(p => p.id === productoId);
                return { name: product?.nombre || 'Desconocido', ventas: count };
            })
            .sort((a, b) => b.ventas - a.ventas)
            .slice(0, 5);

        return { totalProducts, outOfStock, lowStock, bestSellers };
    }, [products, orders]);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Productos</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{reports.totalProducts}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Bajo Stock</CardTitle><Package className="h-4 w-4 text-yellow-500" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{reports.lowStock}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Sin Stock</CardTitle><Package className="h-4 w-4 text-red-500" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{reports.outOfStock}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                        <CardDescription>Top 5 productos por cantidad vendida.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reports.bestSellers}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Legend />
                                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportTab;