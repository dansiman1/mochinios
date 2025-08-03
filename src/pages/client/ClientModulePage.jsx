import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  BookOpen, Package, Sparkles, FileText, MessageSquare, User
} from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import MyOrdersModule from '@/components/client/MyOrdersModule';
import CatalogModule from '@/components/client/CatalogModule';
import MyAccountModule from '@/components/client/MyAccountModule';

const modulesConfig = {
  catalogo: {
    title: "Catálogo",
    icon: <BookOpen />,
    component: CatalogModule,
  },
  'mis-pedidos': {
    title: "Mis Pedidos",
    icon: <Package />,
    component: MyOrdersModule,
  },
  lanzamientos: {
    title: "Lanzamientos",
    icon: <Sparkles />,
    component: () => <p>Próximamente: Próximos lanzamientos exclusivos.</p>,
  },
  facturacion: {
    title: "Facturación",
    icon: <FileText />,
    component: () => <p>Próximamente: Tus datos de facturación e historial.</p>,
  },
  soporte: {
    title: "Soporte",
    icon: <MessageSquare />,
    component: () => <p>Próximamente: Contacta a nuestro equipo de soporte.</p>,
  },
  'mi-cuenta': {
    title: "Mi Cuenta",
    icon: <User />,
    component: MyAccountModule,
  },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const ClientModulePage = () => {
  const { moduleName } = useParams();
  const navigate = useNavigate();
  
  const moduleConfig = modulesConfig[moduleName];

  if (!moduleConfig) {
    navigate('/client/dashboard');
    return null;
  }

  const ModuleComponent = moduleConfig.component;

  return (
    <ClientLayout>
      <Helmet>
        <title>{moduleConfig.title} - Members Club</title>
        <meta name="description" content={`Módulo de ${moduleConfig.title} en Mochini Members Club.`} />
      </Helmet>
      <motion.div
         className="w-full"
         initial="hidden"
         animate="visible"
         variants={itemVariants}
      >
        <div className="flex items-center gap-4 mb-6">
            <div className="text-primary">{React.cloneElement(moduleConfig.icon, { className: "w-8 h-8" })}</div>
            <h1 className="text-3xl font-bold tracking-tight">{moduleConfig.title}</h1>
        </div>
        
        <div>
            <ModuleComponent />
        </div>
      </motion.div>
    </ClientLayout>
  );
};

export default ClientModulePage;