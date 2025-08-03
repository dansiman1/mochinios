import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const GeneralInfoSupplierTab = ({ formData, setFormData }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contacto.') || name.startsWith('direccion.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Proveedor *</Label>
          <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rfc">RFC</Label>
          <Input id="rfc" name="rfc" value={formData.rfc} onChange={handleInputChange} />
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-4">Contacto</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="contacto.email" type="email" value={formData.contacto.email} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="contacto.telefono" type="tel" value={formData.contacto.telefono} onChange={handleInputChange} />
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-4">Dirección</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calle">Calle</Label>
          <Input id="calle" name="direccion.calle" value={formData.direccion.calle} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" name="direccion.numero" value={formData.direccion.numero} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="colonia">Colonia</Label>
          <Input id="colonia" name="direccion.colonia" value={formData.direccion.colonia} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input id="ciudad" name="direccion.ciudad" value={formData.direccion.ciudad} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" name="direccion.estado" value={formData.direccion.estado} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp">Código Postal</Label>
          <Input id="cp" name="direccion.cp" value={formData.direccion.cp} onChange={handleInputChange} />
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-4">Notas</h3>
      <div className="space-y-2">
        <Label htmlFor="notas">Notas Internas</Label>
        <Textarea id="notas" name="notas" value={formData.notas} onChange={handleInputChange} rows={3} />
      </div>
    </div>
  );
};

export default GeneralInfoSupplierTab;