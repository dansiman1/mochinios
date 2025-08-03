import React from 'react';
import ClientSidebar from './ClientSidebar';
import ClientHeader from './ClientHeader';

const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex animated-mochini-background">
      <ClientSidebar />
      <div className="flex flex-col flex-1 bg-background/80 backdrop-blur-sm">
        <ClientHeader />
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;