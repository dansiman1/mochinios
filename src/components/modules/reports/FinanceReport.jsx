import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '@/hooks/useDataContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const FinanceReport = () => {
    const { crud } = useData();
    const { items: transactions } = crud('transacciones_financieras');
    const { items: categories } = crud('categorias_gastos');

    const { monthlyData } = useMemo(() => {
        const now = new Date();
        const data = Array.from({ length: 6 }).map((_, i) => {
            const date = subMonths(now, 5 - i);
            return {
                name: format(date, 'MMM', { locale: es }),
                Ingresos: 0,
                Egresos: 0,
                start: startOfMonth(date),
                end: endOfMonth(date),
            };
        });

        transactions.forEach(t => {
            const tDate = new Date(t.fecha);
            const month = data.find(m => tDate >= m.start && tDate <= m.end);
            if (month) {
                if (t.tipo === 'ingreso') {
                    month.Ingresos += t.monto;
                } else {
                    month.Egresos += t.monto;
                }
            }
        });
        return { monthlyData: data };
    }, [transactions]);

    const expenseByCategory = useMemo(() => {
        const categoryMap = categories.reduce((acc, cat) => {
            acc[cat.id] = { name: cat.nombre, value: 0 };
            return acc;
        }, {});

        transactions.filter(t => t.tipo === 'egreso' && t.categoria_id).forEach(t => {
            if (categoryMap[t.categoria_id]) {
                categoryMap[t.categoria_id].value += t.monto;
            }
        });

        return Object.values(categoryMap).filter(c => c.value > 0);
    }, [transactions, categories]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#A4DE6C', '#D0ED57', '#FFC658'];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Estado de Resultados (Últimos 6 meses)</CardTitle>
                    <CardDescription>Comparativa de ingresos vs. egresos mensuales.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="Ingresos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Egresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Egresos por Categoría</CardTitle>
                    <CardDescription>Distribución de los gastos totales.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {expenseByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default FinanceReport;