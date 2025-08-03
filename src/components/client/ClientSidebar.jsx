import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Package, Sparkles, FileText, MessageSquare, User, LayoutDashboard, Bell } from 'lucide-react';
import MochiniLogo from '@/components/MochiniLogo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const navLinks = [
  { name: 'Dashboard', path: '/client/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Catálogo', path: '/client/module/catalogo', icon: <BookOpen className="h-5 w-5" /> },
  { name: 'Mis Pedidos', path: '/client/module/mis-pedidos', icon: <Package className="h-5 w-5" /> },
  { name: 'Lanzamientos', path: '/client/module/lanzamientos', icon: <Sparkles className="h-5 w-5" /> },
  { name: 'Facturación', path: '/client/module/facturacion', icon: <FileText className="h-5 w-5" /> },
  { name: 'Mi Cuenta', path: '/client/module/mi-cuenta', icon: <User className="h-5 w-5" /> },
];

export const ClientSidebarContent = ({ onLinkClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <MochiniLogo className="h-8 w-auto" />
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map(link => (
            <Button
              key={link.name}
              variant={location.pathname === link.path || location.pathname.startsWith(link.path.split('/')[2] && link.path !== '/client/dashboard' ? link.path : '---') ? 'secondary' : 'ghost'}
              className="justify-start gap-3 my-1"
              onClick={() => handleNavigate(link.path)}
            >
              {link.icon}
              {link.name}
            </Button>
          ))}
        </nav>
      </div>
       <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => handleNavigate('/client/module/soporte')}>
            <MessageSquare className="h-5 w-5" />
            Soporte
          </Button>
          <div className="flex items-center justify-between p-2 rounded-md text-base font-medium text-muted-foreground mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <Card><CardHeader><CardTitle>Notificaciones</CardTitle></CardHeader><CardContent className="flex items-center justify-center h-32"><p className="text-muted-foreground">Próximamente...</p></CardContent></Card>
                </PopoverContent>
              </Popover>
              <ThemeToggle />
          </div>
       </div>
    </>
  );
};

const ClientSidebar = () => {
  return (
    <aside className="hidden border-r bg-muted/40 md:flex md:flex-col w-64">
      <ClientSidebarContent />
    </aside>
  );
};

export default ClientSidebar;