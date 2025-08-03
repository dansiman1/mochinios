export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  VENTAS: 'Ventas',
  INVENTARIO: 'Inventario',
  CONTABILIDAD: 'Contabilidad',
  GERENCIA: 'Gerencia',
  DESARROLLADOR: 'Desarrollador / IT',
};

export const PERMISSIONS_CONFIG = {
  inventario: {
    label: '📦 Inventario',
    actions: { view: 'Ver', create: 'Crear', edit: 'Editar', delete: 'Eliminar' },
  },
  reportes: {
    label: '📊 Reportes y KPIs',
    actions: { view: 'Ver', download: 'Descargar', modify: 'Modificar' },
  },
  pos: {
    label: '💳 POS',
    actions: { sell: 'Vender', return: 'Devolver', cancel: 'Cancelar ventas' },
  },
  pedidos: {
    label: '🛒 Pedidos',
    actions: { view: 'Ver', create: 'Crear', cancel: 'Cancelar', modify: 'Modificar' },
  },
  clientes: {
    label: '👥 Clientes',
    actions: { view: 'Ver', edit: 'Editar', delete: 'Eliminar' },
  },
  finanzas: {
    label: '💰 Finanzas',
    actions: { view: 'Ver', create: 'Crear', edit: 'Editar', delete: 'Eliminar', reports: 'Reportes' },
  },
  configuracion: {
    label: '🛑 Configuración de ERP',
    actions: { view: 'Ver', modify: 'Modificar configuraciones' },
  },
  seguridad: {
    label: '🔑 Acceso a Seguridad',
    actions: { view: 'Ver', create: 'Crear', edit: 'Editar usuarios' },
  },
};

const allPermissions = (value) => Object.keys(PERMISSIONS_CONFIG).reduce((acc, module) => {
  acc[module] = Object.keys(PERMISSIONS_CONFIG[module].actions).reduce((actions, action) => {
    actions[action] = value;
    return actions;
  }, {});
  return acc;
}, {});

export const ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRADOR]: allPermissions(true),
  [ROLES.VENTAS]: {
    ...allPermissions(false),
    pos: { sell: true, return: true, cancel: true },
    inventario: { view: true, create: false, edit: false, delete: false },
    pedidos: { view: true, create: true, cancel: false, modify: false },
    clientes: { view: true, edit: true, delete: false },
  },
  [ROLES.INVENTARIO]: {
    ...allPermissions(false),
    inventario: { view: true, create: true, edit: true, delete: false },
    pedidos: { view: true, create: false, cancel: false, modify: true },
  },
  [ROLES.CONTABILIDAD]: {
    ...allPermissions(false),
    finanzas: { view: true, create: true, edit: true, delete: false, reports: true },
    reportes: { view: true, download: true, modify: false },
  },
  [ROLES.GERENCIA]: {
    ...allPermissions(true),
    inventario: { ...allPermissions(true).inventario, delete: false },
    clientes: { ...allPermissions(true).clientes, delete: false },
    seguridad: { ...allPermissions(true).seguridad, create: false, edit: false },
  },
  [ROLES.DESARROLLADOR]: allPermissions(true),
};

export const generateInitialPermissions = (role) => {
  return ROLE_PERMISSIONS[role] || allPermissions(false);
};