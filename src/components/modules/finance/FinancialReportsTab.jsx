import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, FileText, DollarSign, Package } from 'lucide-react';
import { useData } from '@/hooks/useDataContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const FinancialReportsTab = () => {
  const { crud } = useData();
  const { items: transactions } = crud('transacciones_financieras');
  const { items: cxcItems } = crud('cxc');
  const { items: cxpItems } = crud('cxp');
  const { items: bankAccounts } = crud('cuentas_bancarias');

  const totalReceivable = cxcItems.reduce((acc, item) => acc + (item.saldoPendiente || 0), 0);
  const totalPayable = cxpItems.reduce((acc, item) => acc + (item.saldoPendiente || 0), 0);
  const totalBankBalance = bankAccounts.reduce((acc, item) => acc + (item.saldoActual || 0), 0);

  const { monthlyData, totalIncome, totalExpense } = useMemo(() => {
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

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.fecha);
      const month = data.find(m => tDate >= m.start && tDate <= m.end);
      if (month) {
        if (t.tipo === 'ingreso') {
          month.Ingresos += t.importe;
          totalIncome += t.importe;
        } else {
          month.Egresos += t.importe;
          totalExpense += t.importe;
        }
      }
    });
    return { monthlyData: data, totalIncome, totalExpense };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const categories = {};
    transactions.filter(t => t.tipo === 'egreso').forEach(t => {
        categories[t.categoria] = (categories[t.categoria] || 0) + t.importe;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const StatCard = ({ title, value, icon, description, colorClass }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos Totales (Histórico)" value={`$${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} description="Suma de todos los ingresos" colorClass="text-green-500" />
        <StatCard title="Egresos Totales (Histórico)" value={`$${totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />} description="Suma de todos los egresos" colorClass="text-red-500" />
        <StatCard title="Cuentas por Cobrar" value={`$${totalReceivable.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<Users className="h-4 w-4 text-muted-foreground" />} description="Pendiente de clientes" colorClass="text-yellow-500" />
        <StatCard title="Cuentas por Pagar" value={`$${totalPayable.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<FileText className="h-4 w-4 text-muted-foreground" />} description="Pendiente a proveedores" colorClass="text-orange-500" />
        <StatCard title="Saldo en Bancos y Cajas" value={`$${totalBankBalance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Dinero disponible" colorClass="text-blue-500" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Resultados (Últimos 6 meses)</CardTitle>
            <CardDescription>Ingresos vs. Egresos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Egresos por Categoría</CardTitle>
            <CardDescription>Distribución de los gastos.</CardDescription>
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
    </div>
  );
};

export default FinancialReportsTab;