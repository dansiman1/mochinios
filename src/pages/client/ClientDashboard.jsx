import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '@/components/client/ClientLayout';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Gem, Rocket, ArrowRight } from 'lucide-react';
import { getStatusInfo } from '@/lib/orderStatus';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { currentClient } = useAuth();
  const { crud } = useData();
  const { items: allOrders } = crud('pedidos');

  const clientOrders = useMemo(() => {
    if (!currentClient) return [];
    const clientIdToFilter = currentClient.rol === 'Administrador' ? 1 : currentClient.id;
    return allOrders
      .filter(order => order.clienteId === clientIdToFilter)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [allOrders, currentClient]);

  const lastOrder = clientOrders.length > 0 ? clientOrders[0] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <ClientLayout>
      <Helmet>
        <title>Dashboard - Members Club</title>
        <meta name="description" content="Bienvenido a tu dashboard de Mochini Members Club." />
      </Helmet>
      
      <motion.div 
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido, {currentClient?.nombre?.split(' ')[0] || 'Miembro'}!</h1>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad reciente.</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <CardTitle>Último Pedido</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {lastOrder ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="font-mono text-sm text-muted-foreground">#{lastOrder.id.toString().slice(-6)}</span>
                       <Badge variant={getStatusInfo(lastOrder.estado).variant}>{getStatusInfo(lastOrder.estado).label}</Badge>
                    </div>
                    <p className="text-2xl font-bold">${lastOrder.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Realizado el {format(new Date(lastOrder.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground h-full flex items-center justify-center">Aún no has realizado ningún pedido.</p>
                )}
              </CardContent>
              <CardFooter>
                 <Button className="w-full" variant="outline" onClick={() => navigate('/client/module/mis-pedidos')}>
                  Ver historial de pedidos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gem className="h-6 w-6 text-primary" />
                  <CardTitle>Puntos de Lealtad</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold text-center">0</p>
                <p className="text-muted-foreground text-center mt-2">Puntos acumulados</p>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground text-center w-full">Próximamente: Gana puntos con cada compra y canjéalos por recompensas.</p>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
             <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-primary" />
                  <CardTitle>Lanzamientos Exclusivos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-muted-foreground h-full flex items-center justify-center">No hay lanzamientos activos.</p>
              </CardContent>
               <CardFooter>
                <Button className="w-full" onClick={() => navigate('/client/module/lanzamientos')}>
                  Ver próximos lanzamientos
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
        </motion.div>
      </motion.div>
    </ClientLayout>
  );
};

export default ClientDashboard;