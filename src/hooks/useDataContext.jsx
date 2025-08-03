import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const getInitialData = (key, fallback) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const allKeys = Object.keys(localStorage);
    const initialData = {};
    allKeys.forEach(key => {
      if (key.startsWith('mochinios_')) {
        initialData[key] = getInitialData(key, []);
      }
    });
    const defaultCollections = [
      'mochinios_inventario',
      'mochinios_clientes',
      'mochinios_pedidos',
      'mochinios_cxc',
      'mochinios_cxp',
      'mochinios_cuentas_bancarias',
      'mochinios_transacciones_financieras',
      'mochinios_proveedores',
      'mochinios_usuarios',
      'mochinios_traspasos',
      'mochinios_categorias_gastos',
      'mochinios_empleados',
      'mochinios_asistencias',
      'mochinios_nominas',
    ];
    defaultCollections.forEach(key => {
      if (!initialData[key]) {
        initialData[key] = [];
      }
    });
    return initialData;
  });

  const crud = useCallback((key) => {
    const storageKey = `mochinios_${key}`;
    
    const items = data[storageKey] || [];

    const setItems = (newItems) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(newItems));
        setData(prevData => ({ ...prevData, [storageKey]: newItems }));
      } catch (error) {
        console.error(`Error setting localStorage key "${storageKey}":`, error);
      }
    };

    const addItem = (item) => {
      const currentItems = getInitialData(storageKey, []);
      const newItem = { ...item, id: new Date().getTime() + Math.random() };
      const newItems = [...currentItems, newItem];
      setItems(newItems);
      return newItem;
    };

    const updateItem = (id, updatedItem) => {
      const currentItems = getInitialData(storageKey, []);
      const newItems = currentItems.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      );
      setItems(newItems);
      return { ...updatedItem, id };
    };

    const deleteItem = (id) => {
      const currentItems = getInitialData(storageKey, []);
      const newItems = currentItems.filter((item) => item.id !== id);
      setItems(newItems);
    };
    
    const getItemById = (id) => {
        const currentItems = getInitialData(storageKey, []);
        return currentItems.find(item => item.id === id);
    };

    const refreshData = () => {
        const freshData = getInitialData(storageKey, []);
        setData(prevData => ({ ...prevData, [storageKey]: freshData }));
    };

    return { items, addItem, updateItem, deleteItem, getItemById, setItems, refreshData };
  }, [data, setData]);

  useEffect(() => {
    const allKeys = Object.keys(localStorage);
    const updatedInitialData = {};
    allKeys.forEach(key => {
      if (key.startsWith('mochinios_')) {
        updatedInitialData[key] = getInitialData(key, []);
      }
    });
    const defaultCollections = [
      'mochinios_inventario', 'mochinios_clientes', 'mochinios_pedidos',
      'mochinios_cxc', 'mochinios_cxp', 'mochinios_cuentas_bancarias',
      'mochinios_transacciones_financieras', 'mochinios_proveedores',
      'mochinios_usuarios', 'mochinios_traspasos', 'mochinios_categorias_gastos',
      'mochinios_empleados', 'mochinios_asistencias', 'mochinios_nominas',
    ];
    defaultCollections.forEach(key => {
        if (!updatedInitialData[key]) {
            updatedInitialData[key] = [];
        }
    });
    setData(updatedInitialData);
  }, []);

  return (
    <DataContext.Provider value={{ crud, data }}>
      {children}
    </DataContext.Provider>
  );
};