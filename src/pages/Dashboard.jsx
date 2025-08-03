import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, DollarSign, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/hooks/useDataContext';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import AppHeader from '@/components/AppHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { crud } = useData();
  const { items: orders } = crud('pedidos');
  const { items: clients } = crud('clientes');
  const { items: inventory } = crud('inventario');
  const { items: transactions } = crud('transacciones_financieras');

  const handleCardClick = (path, tab) => {
    navigate(path, { state: { defaultTab: tab } });
  };

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const kpiData = useMemo(() => {
    const dailyOrders = orders.filter(o => o.fecha && isWithinInterval(new Date(o.fecha), { start: startOfToday, end: endOfToday }));
    const dailyClients = clients.filter(c => c.fecha_registro && isWithinInterval(new Date(c.fecha_registro), { start: startOfToday, end: endOfToday }));
    return {
      dailySalesCount: dailyOrders.length,
      newClientsCount: dailyClients.length,
      dailyRevenue: dailyOrders.reduce((sum, order) => sum + order.total, 0)
    };
  }, [orders, clients, startOfToday, endOfToday]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, i)).reverse();
    return last7Days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dailyIncome = transactions.filter(t => t.tipo === 'ingreso' && t.fecha && isWithinInterval(new Date(t.fecha), { start: dayStart, end: dayEnd })).reduce((sum, t) => sum + t.monto, 0);
      const dailyExpenses = transactions.filter(t => t.tipo === 'egreso' && t.fecha && isWithinInterval(new Date(t.fecha), { start: dayStart, end: dayEnd })).reduce((sum, t) => sum + t.monto, 0);
      return {
        name: format(day, 'EEE', { locale: es }),
        Ingresos: dailyIncome,
        Gastos: dailyExpenses
      };
    });
  }, [transactions, today]);

  const lowStockProducts = useMemo(() => {
    return inventory.filter(p => p.existencias <= (p.cantidad_minima || 5)).slice(0, 5);
  }, [inventory]);

  const latestOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
  }, [orders]);

  const getClientName = clientId => clients.find(c => c.id === clientId)?.nombre || 'N/A';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - MochiniOS</title>
        <meta name="description" content="Dashboard principal para empleados de Mochini Couture." />
      </Helmet>
      <div className="min-h-screen w-full text-foreground flex flex-col">
        <AppHeader />
        
        <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
          <motion.div className="w-full" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight mb-6">Dashboard</motion.h1>
            
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card className="cursor-pointer glass-effect transition-colors" onClick={() => handleCardClick('/module/reportes', 'sales')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiData.dailySalesCount}</div>
                  <p className="text-xs text-muted-foreground">Total de pedidos hoy</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer glass-effect transition-colors" onClick={() => handleCardClick('/module/reportes', 'customers')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{kpiData.newClientsCount}</div>
                  <p className="text-xs text-muted-foreground">Registrados hoy</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer glass-effect transition-colors" onClick={() => handleCardClick('/module/reportes', 'finance')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos del Día</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${kpiData.dailyRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total facturado hoy</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 glass-effect">
                <CardHeader>
                  <CardTitle>Análisis Financiero</CardTitle>
                  <p className="text-sm text-muted-foreground">Ingresos vs. Gastos de los últimos 7 días.</p>
                </CardHeader>
                <CardContent className="pl-2 pr-6 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background) / 0.8)', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', backdropFilter: 'blur(10px)' }} formatter={value => [`$${value.toFixed(2)}`]} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="Ingresos" stackId="1" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIngresos)" />
                      <Area type="monotone" dataKey="Gastos" stackId="1" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorGastos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Últimos Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {latestOrders.map(order => (
                        <div key={order.id} className="flex items-center">
                          <div className="flex-grow">
                            <p className="text-sm font-medium">{getClientName(order.clienteId)}</p>
                            <p className="text-xs text-muted-foreground">#{order.id.toString().slice(-6)} - {format(new Date(order.fecha), 'PPp', { locale: es })}</p>
                          </div>
                          <div className="text-sm font-semibold">${order.total.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-destructive">Bajo Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lowStockProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{p.nombre}</p>
                            <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                          </div>
                          <div className="text-sm font-bold text-destructive">{p.existencias} restantes</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
};
export default Dashboard;