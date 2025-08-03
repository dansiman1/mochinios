import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './useDataContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { crud, data } = useData(); // Get data as well to check for readiness
  const [currentUser, setCurrentUser] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);

  // Initialize users and clients only when data is ready
  const users = data['mochinios_usuarios'] || [];
  const clients = data['mochinios_clientes'] || [];

  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    const storedClient = sessionStorage.getItem('currentClient');
    if (storedClient) {
      setCurrentClient(JSON.parse(storedClient));
    }
  }, []);

  const login = (identifier, password) => {
    const user = users.find(
      u => (u.usuario === identifier || u.nombre === identifier) && u.contrasena === password
    );
    if (user && user.estado === 'Activo') {
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  };
  
  const clientLogin = (email, password) => {
    // For dev purposes, allow admin login as a client
    if (email === 'admin' && password === 'administrativa') {
        const adminAsClient = {
            id: 999, // mock client id
            nombre: 'Admin Test Client',
            correo: 'admin@mochini.com',
            rol: 'Administrador'
        };
        setCurrentClient(adminAsClient);
        sessionStorage.setItem('currentClient', JSON.stringify(adminAsClient));
        return adminAsClient;
    }

    const client = clients.find(c => c.correo === email && c.password === password);
    if (client && client.estado === 'Activo') {
        setCurrentClient(client);
        sessionStorage.setItem('currentClient', JSON.stringify(client));
        return client;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const clientLogout = () => {
    setCurrentClient(null);
    sessionStorage.removeItem('currentClient');
  };

  const hasPermission = (module, action) => {
    if (currentUser?.rol === 'Administrador') return true;
    return !!currentUser?.permissions?.[module]?.[action];
  };

  const requestPinAuth = (pin) => {
    const authorizedUser = users.find(u => u.pin === pin && u.estado === 'Activo');
    if (authorizedUser) {
      return true;
    }
    return false;
  };

  const value = {
    currentUser,
    currentClient,
    login,
    clientLogin,
    logout,
    clientLogout,
    hasPermission,
    requestPinAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};