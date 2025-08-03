import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/hooks/useAuth';

const MembersLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { clientLogin } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    const client = clientLogin(email, password);
    if (client) {
      toast({
        title: `Bienvenido, ${client.nombre}!`,
        description: "Has ingresado al Members Club.",
      });
      navigate('/client/dashboard');
    } else {
      toast({
        title: "Error de autenticación",
        description: "El correo o la contraseña son incorrectos.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "🚧 Esta función aún no está implementada",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀",
      duration: 4000,
    });
  };

  return (
    <>
      <Helmet>
        <title>Members Club - MochiniOS</title>
        <meta name="description" content="Portal exclusivo para miembros del Members Club de Mochini Couture." />
      </Helmet>
      
      <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${theme === 'dark' ? 'animated-gradient-dark' : 'bg-gray-100'}`}>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`rounded-3xl p-8 shadow-2xl ${theme === 'dark' ? 'glass-effect-dark' : 'bg-white'}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center space-y-2 mb-8"
            >
              <h1 className="text-3xl font-light text-foreground tracking-tight">
                MochiniOS
              </h1>
              <p className="text-primary font-light">
                Portal Members Club
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground font-light">
                  Correo o Usuario
                </Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="tu@email.com o admin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground font-light">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-transform hover:scale-105"
              >
                Entrar
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-6"
            >
              <button
                onClick={handleForgotPassword}
                className="text-primary hover:underline text-sm font-light transition-colors duration-300"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </motion.div>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-sm text-muted-foreground font-light">
            © 2025 Mochini Couture. Todos los derechos reservados.
          </p>
        </motion.footer>
      </div>
    </>
  );
};

export default MembersLogin;