import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Search, Bell, Menu, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import MochiniLogo from '@/components/MochiniLogo';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navModules = [
  { name: "Dashboard", path: "/dashboard", icon: <Menu className="h-5 w-5 mr-3"/> },
  { name: "Inventario", path: "/module/inventario", icon: <Menu className="h-5 w-5 mr-3"/> },
  { name: "Clientes", path: "/module/clientes", icon: <Menu className="h-5 w-5 mr-3"/> },
  { name: "Finanzas", path: "/module/finanzas", icon: <Menu className="h-5 w-5 mr-3"/> },
  { name: "RR.HH.", path: "/module/hr", icon: <Briefcase className="h-5 w-5 mr-3"/> },
  { name: "Usuarios", path: "/module/usuarios", icon: <Menu className="h-5 w-5 mr-3"/> },
  { name: "Reportes", path: "/module/reportes", icon: <Menu className="h-5 w-5 mr-3"/> },
  { name: "POS", path: "/pos", icon: <Menu className="h-5 w-5 mr-3"/> },
];

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/os');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSheetOpen(false);
  };

  const UserMenuMobile = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
         <img className="h-9 w-9 rounded-full cursor-pointer" alt="User avatar" src="https://images.unsplash.com/flagged/photo-1608632359963-5828fa3b4141" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.nombre || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentUser?.rol || 'Rol'}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          
          <div className="md:hidden flex items-center">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <div className="p-4">
                  <MochiniLogo className="h-8 w-auto mb-8" />
                  <nav className="flex flex-col gap-2">
                    {navModules.map(m => (
                      <SheetClose asChild key={m.name}>
                        <a onClick={() => handleNavigate(m.path)} className={`flex items-center p-2 rounded-md text-base font-medium transition-colors cursor-pointer ${location.pathname.startsWith(m.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
                          {m.icon}
                          {m.name}
                        </a>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="mt-8 pt-4 border-t">
                     <Popover>
                        <PopoverTrigger asChild>
                          <a className="flex items-center p-2 rounded-md text-base font-medium text-muted-foreground hover:bg-accent cursor-pointer">
                            <Bell className="mr-3 h-5 w-5" /> Notificaciones
                          </a>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <Card><CardHeader><CardTitle>Notificaciones</CardTitle></CardHeader><CardContent className="flex items-center justify-center h-32"><p className="text-muted-foreground">Próximamente...</p></CardContent></Card>
                        </PopoverContent>
                      </Popover>
                  </div>
                   <div className="mt-4">
                     <div className="flex items-center justify-between p-2 rounded-md text-base font-medium text-muted-foreground">
                        <span className="flex items-center">Modo Oscuro</span>
                        <ThemeToggle />
                      </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <MochiniLogo className="h-8 w-auto" />
            <nav className="flex items-center gap-6 text-sm font-medium">
              {navModules.map(m => ( <a key={m.name} onClick={() => handleNavigate(m.path)} className={`transition-colors cursor-pointer ${location.pathname.startsWith(m.path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}> {m.name} </a> ))}
            </nav>
          </div>

          <div className="md:hidden absolute left-1/2 -translate-x-1/2">
            <MochiniLogo className="h-7 w-auto" />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80"><Card><CardHeader><CardTitle>Notificaciones</CardTitle></CardHeader><CardContent className="flex items-center justify-center h-32"><p className="text-muted-foreground">Próximamente...</p></CardContent></Card></PopoverContent>
                </Popover>
                <ThemeToggle />
            </div>

            <div className="hidden md:flex items-center gap-3 border-l border-border/60 pl-4">
              <button onClick={() => navigate('/module/usuarios')} className="flex items-center gap-3 focus:outline-none">
                <img className="h-9 w-9 rounded-full" alt="User avatar" src="https://images.unsplash.com/flagged/photo-1608632359963-5828fa3b4141" />
                <div>
                  <p className="text-sm font-semibold text-left">{currentUser?.nombre || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground text-left">{currentUser?.rol || 'Rol'}</p>
                </div>
              </button>
              <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-5 w-5" /></Button>
            </div>
             <div className="md:hidden">
              <UserMenuMobile />
            </div>
          </div>
        </div>
      </header>
      <GlobalSearch isOpen={isSearchOpen} setIsOpen={setSearchOpen} />
    </>
  );
};

export default AppHeader;