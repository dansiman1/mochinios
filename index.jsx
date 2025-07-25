import React from 'react';
import { useNavigate } from 'react-router-dom';
import './clientes_styles.css';

const Clientes = () => {
  const navigate = useNavigate();

  const clientes = [
    { id: 1, nombre: 'Andrea Romero', telefono: '555-1234' },
    { id: 2, nombre: 'Carlos Méndez', telefono: '555-5678' },
    { id: 3, nombre: 'Valeria López', telefono: '555-9012' }
  ];

  const irADetalle = (id) => {
    navigate(`/clientes/${id}`);
  };

  return (
    <div className="clientes-contenedor">
      <h2>Clientes</h2>
      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.telefono}</td>
              <td>
                <button onClick={() => irADetalle(cliente.id)}>Ver Detalle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clientes;