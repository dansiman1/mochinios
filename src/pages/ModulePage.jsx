import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Package, Users, DollarSign, BarChart2,
  Shield, LayoutDashboard, Briefcase
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import InventoryModule from '@/components/modules/InventoryModule';
import ClientModule from '@/components/modules/ClientModule';
import UserManagementModule from '@/components/modules/UserManagementModule';
import FinanceModule from '@/components/modules/FinanceModule';
import ReportsModule from '@/components/modules/ReportsModule';
import HRModule from '@/components/modules/hr/HRModule';

const modulesConfig = {
  inventario: {
    title: "Inventario, Ventas y Pedidos",
    icon: <Package />,
    component: InventoryModule,
  },
  clientes: {
    title: "Clientes y Members Club",
    icon: <Users />,
    component: ClientModule,
  },
  usuarios: {
    title: "Usuarios, Roles y Permisos",
    icon: <Shield />,
    component: UserManagementModule,
  },
  finanzas: {
    title: "Finanzas y Facturación",
    icon: <DollarSign />,
    component: FinanceModule,
  },
  reportes: {
    title: "Reportes y KPIs",
    icon: <BarChart2 />,
    component: ReportsModule,
  },
  hr: {
    title: "Recursos Humanos",
    icon: <Briefcase />,
    component: HRModule,
  },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const ModulePage = () => {
  const { moduleName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const moduleConfig = modulesConfig[moduleName] || { title: "Módulo Desconocido", icon: <LayoutDashboard /> };

  const renderContent = () => {
    if (moduleConfig.component) {
      const ModuleComponent = moduleConfig.component;
      return <ModuleComponent locationState={location.state} />;
    }
    navigate('/dashboard');
    return null;
  };

  return (
    <>
      <Helmet>
        <title>{moduleConfig.title} - MochiniOS</title>
        <meta name="description" content={`Módulo de ${moduleConfig.title} en MochiniOS.`} />
      </Helmet>
      <div className="min-h-screen w-full text-foreground flex flex-col">
        <AppHeader />

        <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
          <motion.div
             className="w-full"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
                <div className="text-primary">{React.cloneElement(moduleConfig.icon, { className: "w-8 h-8" })}</div>
                <h1 className="text-3xl font-bold tracking-tight">{moduleConfig.title}</h1>
            </motion.div>
            
            <motion.div variants={itemVariants}>
                {renderContent()}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default ModulePage;