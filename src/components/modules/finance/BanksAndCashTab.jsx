import React, { useState, useMemo } from 'react';
import { useData } from '@/hooks/useDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ArrowUpRight, ArrowDownLeft, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import NewAccountModal from './modals/NewAccountModal';
import NewTransactionModal from './modals/NewTransactionModal';
import MochiniLogo from '@/components/MochiniLogo';

const AccountCard = ({ account, isSelected, onClick }) => {
  const isBank = account.tipo === 'Cuenta Bancaria';
  const formattedAccountNumber = account.numeroCuenta 
    ? `•••• ${account.numeroCuenta.slice(-4)}`
    : 'Efectivo';

  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'}`} 
      onClick={onClick}
    >
      {isBank ? (
        <div className="relative aspect-[1.586] bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-black rounded-md p-3 flex flex-col justify-between text-white shadow-md overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full opacity-50"></div>
          <div className="absolute -bottom-8 -left-2 w-24 h-24 bg-secondary/20 rounded-full opacity-50"></div>
          <div className="flex justify-between items-start">
            <span className="font-semibold text-sm">{account.nombre}</span>
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <p className="font-mono text-lg tracking-wider">{formattedAccountNumber}</p>
            <div className="flex justify-between items-end mt-1">
              <p className="text-xs uppercase">{account.tipo}</p>
              <p className="font-bold text-lg">${account.saldoActual.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-card rounded-md p-3 flex flex-col justify-between border">
          <div className="flex justify-between items-center">
            <span className="font-semibold">{account.nombre}</span>
            <span className="font-bold text-lg">${account.saldoActual.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">{account.tipo}</p>
        </div>
      )}
    </div>
  );
};

const BanksAndCashTab = () => {
  const { crud } = useData();
  const { items: accounts } = crud('cuentas_bancarias');
  const { items: transactions } = crud('transacciones_financieras');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  
  const forceUpdate = React.useReducer(() => ({}), {})[1];

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => selectedAccount === null || t.cuentaId === selectedAccount)
      .filter(t => t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [transactions, selectedAccount, searchTerm]);
  
  const handleAccountCreated = () => {
      forceUpdate();
  };
  
  const handleTransactionCreated = () => {
      forceUpdate();
  };
  
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Cuentas</CardTitle>
              <CardDescription>Saldos actuales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className={`p-4 rounded-lg cursor-pointer border ${selectedAccount === null ? 'border-primary bg-primary/5' : ''}`} 
                onClick={() => setSelectedAccount(null)}
              >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Todas las Cuentas</span>
                  </div>
              </div>
              {accounts.map(account => (
                <AccountCard 
                  key={account.id} 
                  account={account} 
                  isSelected={selectedAccount === account.id}
                  onClick={() => setSelectedAccount(account.id)}
                />
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsNewAccountModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Nueva Cuenta</Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Movimientos</CardTitle>
                  <CardDescription>Historial de ingresos y egresos.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar descripción..." className="pl-8 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Button onClick={() => setIsNewTransactionModalOpen(true)} className="flex-shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Movimiento</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell data-label="Fecha">{format(new Date(t.fecha), 'dd/MM/yyyy')}</TableCell>
                      <TableCell data-label="Descripción">{t.descripcion}</TableCell>
                      <TableCell data-label="Tipo">
                        {t.tipo === 'ingreso' ? (
                          <span className="flex items-center justify-end md:justify-start text-green-500"><ArrowDownLeft className="mr-1 h-4 w-4" /> Ingreso</span>
                        ) : (
                          <span className="flex items-center justify-end md:justify-start text-red-500"><ArrowUpRight className="mr-1 h-4 w-4" /> Egreso</span>
                        )}
                      </TableCell>
                      <TableCell data-label="Importe" className="text-right font-medium">${t.importe.toFixed(2)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan="4" className="h-24 text-center">No hay movimientos en esta cuenta.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <NewAccountModal isOpen={isNewAccountModalOpen} setIsOpen={setIsNewAccountModalOpen} onAccountCreated={handleAccountCreated} />
      <NewTransactionModal isOpen={isNewTransactionModalOpen} setIsOpen={setIsNewTransactionModalOpen} onTransactionCreated={handleTransactionCreated} initialAccountId={selectedAccount} />
    </>
  );
};

export default BanksAndCashTab;