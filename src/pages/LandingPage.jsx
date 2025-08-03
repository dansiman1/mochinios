import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>MochiniOS - Sistema Oficial de Mochini Couture</title>
        <meta name="description" content="Acceso al ecosistema privado de Mochini Couture. Portal de entrada para clientes y empleados." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden animated-mochini-background">
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-4"
            >
             <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/fe89610e-fec7-4f20-bff3-c376aef88bc3/8a65d8054d89115b9f1bdf5a42e043c5.png" alt="MochiniOS Logo" className="w-48 mx-auto" />
              <h1 className="text-5xl md:text-6xl font-light text-gray-900 tracking-tight">
                MochiniOS
              </h1>
              <p className="text-lg md:text-xl text-gray-700 font-light">
                El sistema oficial de Mochini Couture
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <Button
                onClick={() => navigate('/members')}
                className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white text-lg font-medium rounded-2xl shadow-lg transition-transform hover:scale-105"
              >
                <Crown className="w-6 h-6 mr-3" />
                Acceso Clientes
              </Button>

              <Button
                onClick={() => navigate('/os')}
                variant="outline"
                className="w-full h-16 bg-white/50 hover:bg-white/80 text-gray-900 border-gray-900/20 text-lg font-medium rounded-2xl shadow-lg transition-transform hover:scale-105"
              >
                <Lock className="w-6 h-6 mr-3" />
                Acceso Empleados
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-sm text-gray-600 font-light">
            © 2025 Mochini Couture. Todos los derechos reservados.
          </p>
        </motion.footer>
      </div>
    </>
  );
};

export default LandingPage;