import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PRICE_LISTS } from '@/lib/constants';

export const PricingTab = ({ formData, setFormData, isLocked }) => {
    const [formulas, setFormulas] = useState(
        formData.formulas || {
            p2: -10, p3: -20, pink: -5, silver: -15, gold: -25
        }
    );

    useEffect(() => {
        if (formData.formulas) {
            setFormulas(formData.formulas);
        }
    }, [formData.formulas]);

    const handlePriceChange = (priceKey, value) => {
        if (isLocked) return;
        const parsedValue = value === '' ? '' : parseFloat(value);
        if (parsedValue < 0 && value !== '') return;
        setFormData(prev => ({
            ...prev,
            precios: { ...prev.precios, [priceKey]: parsedValue }
        }));
    };

    const handleFormulaChange = (priceKey, value) => {
        if (isLocked) return;
        const parsedValue = value === '' ? '' : parseFloat(value);
        setFormulas(prev => {
            const newFormulas = { ...prev, [priceKey]: parsedValue };
            setFormData(fd => ({ ...fd, formulas: newFormulas }));
            return newFormulas;
        });
    };

    const applyFormulas = () => {
        if (isLocked) return;
        const p1 = parseFloat(formData.precios?.p1);
        if (!isNaN(p1) && p1 > 0) {
            const newPrices = { ...formData.precios };
            Object.keys(formulas).forEach(key => {
                const formulaValue = parseFloat(formulas[key]);
                if (!isNaN(formulaValue)) {
                    const calculatedPrice = p1 + formulaValue;
                    newPrices[key] = calculatedPrice > 0 ? calculatedPrice : 0;
                }
            });
            setFormData(prev => ({ ...prev, precios: newPrices }));
        }
    };
    
    useEffect(() => {
        applyFormulas();
    }, [formData.precios?.p1, formulas]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            <Card>
                <CardHeader>
                    <CardTitle>Calculadora de Precios</CardTitle>
                    <CardDescription>Define el precio base (P1) y las fórmulas para calcular los demás precios automáticamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="precios.p1" className="text-lg font-semibold text-primary">Precio Base (P1 - Menudeo)</Label>
                        <Input
                            id="precios.p1"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="text-lg h-12 mt-1"
                            value={formData.precios?.p1 === '' ? '' : Number(formData.precios?.p1 || 0)}
                            onChange={(e) => handlePriceChange('p1', e.target.value)}
                            disabled={isLocked}
                        />
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium">Fórmulas de Ajuste (desde P1)</h4>
                        {Object.keys(formulas).map(key => {
                            const list = PRICE_LISTS.find(l => l.id === key);
                            return list.id !== 'p1' && (
                                <div key={key} className="flex items-center gap-2">
                                    <Label htmlFor={`formula.${key}`} className="w-28">{list.name}</Label>
                                    <Input
                                        id={`formula.${key}`}
                                        type="number"
                                        step="0.01"
                                        className="w-32"
                                        value={formulas[key]}
                                        onChange={(e) => handleFormulaChange(key, e.target.value)}
                                        disabled={isLocked}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Listas de Precios Finales</CardTitle>
                    <CardDescription>Estos son los precios que se aplicarán. Puedes ajustarlos manualmente si es necesario.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {PRICE_LISTS.map(list => (
                        <div key={list.id} className="flex items-center gap-4">
                            <Label htmlFor={`precios.${list.id}`} className="w-1/3">{list.name}</Label>
                            <div className="w-2/3 flex items-center gap-2">
                                <span className="text-muted-foreground">$</span>
                                <Input
                                    id={`precios.${list.id}`}
                                    name={`precios.${list.id}`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.precios?.[list.id] === '' ? '' : Number(formData.precios?.[list.id] || 0)}
                                    onChange={(e) => handlePriceChange(list.id, e.target.value)}
                                    className={list.id === 'p1' ? 'font-bold' : ''}
                                    disabled={isLocked}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};