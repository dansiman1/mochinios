import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import MochiniLogo from '@/components/MochiniLogo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ClientSidebarContent } from './ClientSidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ClientHeader = () => {
  const navigate = useNavigate();
  const { currentClient, clientLogout } = useAuth();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => {
    clientLogout();
    navigate('/members');
  };

  const UserMenuMobile = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <img className="h-9 w-9 rounded-full cursor-pointer" alt="Client avatar" src={`https://i.pravatar.cc/150?u=${currentClient?.correo}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentClient?.nombre || 'Miembro'}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentClient?.correo}</p>
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
            <ClientSidebarContent onLinkClick={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      
       <div className="hidden md:flex md:flex-1">
         <MochiniLogo className="h-8 w-auto" />
      </div>

       <div className="md:hidden flex-1 flex justify-center">
         <MochiniLogo className="h-7 w-auto" />
      </div>

      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon">
           <Search className="h-5 w-5" />
         </Button>
        <div className="md:hidden">
          <UserMenuMobile />
        </div>
        <div className="hidden md:flex items-center gap-3 border-l pl-3 ml-1">
          <button onClick={() => navigate('/client/module/mi-cuenta')} className="flex items-center gap-3">
            <img className="h-9 w-9 rounded-full" alt="Client avatar" src={`https://i.pravatar.cc/150?u=${currentClient?.correo}`} />
            <div>
              <p className="text-sm font-semibold text-left">{currentClient?.nombre || 'Miembro'}</p>
              <p className="text-xs text-muted-foreground text-left">Members Club</p>
            </div>
          </button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;