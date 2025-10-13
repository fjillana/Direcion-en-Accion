

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Trash2, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "@/components/ui/badge";

// DETAILED INVESTMENT TYPE
export type Investment = {
  id: string;
  name: string;
  description: string;
  cost: {
    type: 'fixed' | 'range';
    value: number | [number, number];
  };
  effects: {
    nma?: number;
    morale?: number;
    personnelCostReduction?: number; // e.g., 0.02 for 2%
    iam?: number; // IAM points bonus
    cashInjection?: number; // For F4
    reputationPenalty?: number; // For F4
  };
  xpBonus: {
    type: 'fixed' | 'scaled';
    finances?: number | [number, number];
    reputation?: number | [number, number];
    morale?: number | [number, number];
  };
};

type CrisisOption = {
  label: string;
  costText: string;
  cost: number;
  effect: string;
};

export type Crisis = {
  id: string;
  name: string;
  description: string;
  options: CrisisOption[];
};

type CatalogItem = Investment | Crisis;

interface CatalogEditorProps {
  title: string;
  description: string;
  data: CatalogItem[];
  type: "investment" | "crisis";
}

const emptyInvestment: Investment = {
    id: `inv_${Date.now()}`,
    name: "",
    description: "",
    cost: { type: 'fixed', value: 0 },
    effects: {},
    xpBonus: { type: 'fixed', finances: 0, reputation: 0, morale: 0 }
};

interface InvestmentFormProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialData?: Investment;
    onSave: (investment: Investment) => void;
}

function InvestmentForm({ isOpen, onOpenChange, initialData, onSave }: InvestmentFormProps) {
    const [investment, setInvestment] = useState<Investment>(initialData || emptyInvestment);
    
    useEffect(() => {
        setInvestment(initialData ? JSON.parse(JSON.stringify(initialData)) : { ...emptyInvestment, id: `inv_${Date.now()}` });
    }, [initialData, isOpen]);
    
    const handleChange = (field: string, value: any) => {
        setInvestment(prev => {
            const keys = field.split('.');
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            
            const finalKey = keys[keys.length - 1];
            current[finalKey] = value;
            
            if(field === 'cost.type') {
                newState.cost.value = value === 'fixed' ? 0 : [0, 0];
            }
            if(field === 'xpBonus.type' && value === 'fixed') {
                if(Array.isArray(newState.xpBonus.finances)) newState.xpBonus.finances = 0;
                if(Array.isArray(newState.xpBonus.reputation)) newState.xpBonus.reputation = 0;
                if(Array.isArray(newState.xpBonus.morale)) newState.xpBonus.morale = 0;
            }
            if(field === 'xpBonus.type' && value === 'scaled') {
                if(typeof newState.xpBonus.finances === 'number') newState.xpBonus.finances = [0,0];
                if(typeof newState.xpBonus.reputation === 'number') newState.xpBonus.reputation = [0,0];
                if(typeof newState.xpBonus.morale === 'number') newState.xpBonus.morale = [0,0];
            }

            return newState;
        });
    };
    
    const handleSave = () => {
        onSave(investment);
        onOpenChange(false);
    };

    const handleNumericChange = (field: string, value: string) => {
        const numValue = value === '' ? undefined : Number(value);
        handleChange(field, numValue);
    };
    
    const getXpValue = (area: 'finances' | 'reputation' | 'morale'): number | [number, number] | undefined => {
        return investment.xpBonus[area];
    }

    const setXpValue = (area: 'finances' | 'reputation' | 'morale', value: any) => {
        handleChange(`xpBonus.${area}`, value);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? `Editar Inversión: ${initialData.name}` : "Añadir Nueva Inversión"}</DialogTitle>
                    <DialogDescription>Define todos los parámetros y efectos de esta inversión en la simulación.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    {/* Columna Izquierda */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Información Básica</h3>
                        <div>
                            <Label htmlFor="inv-name">Nombre</Label>
                            <Input id="inv-name" value={investment.name} onChange={e => handleChange('name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="inv-desc">Descripción</Label>
                            <Textarea id="inv-desc" value={investment.description} onChange={e => handleChange('description', e.target.value)} />
                        </div>

                        <h3 className="font-semibold text-lg border-b pb-2 mt-4">Coste</h3>
                        <div className="space-y-2">
                           <Label>Tipo de Coste</Label>
                           <Select value={investment.cost.type} onValueChange={value => handleChange('cost.type', value)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="fixed">Fijo</SelectItem>
                                  <SelectItem value="range">Rango</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        {investment.cost.type === 'fixed' ? (
                            <div>
                                <Label htmlFor="cost-fixed">Coste Fijo (CC)</Label>
                                <Input id="cost-fixed" type="number" value={investment.cost.value || ''} onChange={e => handleNumericChange('cost.value', e.target.value)} />
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <div>
                                    <Label htmlFor="cost-range-min">Mínimo</Label>
                                    <Input id="cost-range-min" type="number" value={(investment.cost.value as [number, number])?.[0] || ''} onChange={e => handleChange('cost.value', [Number(e.target.value), (investment.cost.value as [number, number])?.[1] || 0])} />
                                </div>
                                 <div>
                                    <Label htmlFor="cost-range-max">Máximo</Label>
                                    <Input id="cost-range-max" type="number" value={(investment.cost.value as [number, number])?.[1] || ''} onChange={e => handleChange('cost.value', [(investment.cost.value as [number, number])?.[0] || 0, Number(e.target.value)])} />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Columna Derecha */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Efectos Directos en KPIs</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="effect-nma">Bonus NMA</Label>
                                <Input id="effect-nma" type="number" step="0.1" value={investment.effects.nma || ''} onChange={e => handleNumericChange('effects.nma', e.target.value)} />
                             </div>
                              <div>
                                <Label htmlFor="effect-morale">Bonus Moral</Label>
                                <Input id="effect-morale" type="number" step="1" value={investment.effects.morale || ''} onChange={e => handleNumericChange('effects.morale', e.target.value)} />
                             </div>
                             <div>
                                <Label htmlFor="effect-iam">Bonus IAM</Label>
                                <Input id="effect-iam" type="number" step="1" value={investment.effects.iam || ''} onChange={e => handleNumericChange('effects.iam', e.target.value)} />
                             </div>
                             <div>
                                <Label htmlFor="effect-cost-reduc">Reducción Coste Personal (%)</Label>
                                <Input id="effect-cost-reduc" type="number" step="1" value={(investment.effects.personnelCostReduction || 0) * 100} onChange={e => handleChange('effects.personnelCostReduction', Number(e.target.value) / 100)} />
                             </div>
                         </div>
                        <h3 className="font-semibold text-lg border-b pb-2 mt-4">Bonus de XP</h3>
                         <div className="space-y-2">
                          <Label>Tipo de Bonus</Label>
                          <Select value={investment.xpBonus.type} onValueChange={value => handleChange('xpBonus.type', value)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="fixed">Fijo</SelectItem>
                                  <SelectItem value="scaled">Escalonado (por coste)</SelectItem>
                              </SelectContent>
                          </Select>
                        </div>
                        
                        {investment.xpBonus.type === 'fixed' ? (
                            <div className="grid grid-cols-3 gap-2">
                                <div><Label>XP Finanzas</Label><Input type="number" value={(investment.xpBonus.finances as number) || ''} onChange={e => handleNumericChange('xpBonus.finances', e.target.value)} /></div>
                                <div><Label>XP Reputación</Label><Input type="number" value={(investment.xpBonus.reputation as number) || ''} onChange={e => handleNumericChange('xpBonus.reputation', e.target.value)} /></div>
                                <div><Label>XP Moral</Label><Input type="number" value={(investment.xpBonus.morale as number) || ''} onChange={e => handleNumericChange('xpBonus.morale', e.target.value)} /></div>
                            </div>
                        ) : (
                           <div className="space-y-4">
                                <div>
                                    <Label>XP Finanzas (Min-Max)</Label>
                                    <div className="flex gap-2"><Input type="number" placeholder="Min" value={(getXpValue('finances') as [number,number])?.[0] || ''} onChange={e => setXpValue('finances', [Number(e.target.value), (getXpValue('finances') as [number,number])?.[1] || 0])} /><Input type="number" placeholder="Max" value={(getXpValue('finances') as [number,number])?.[1] || ''} onChange={e => setXpValue('finances', [(getXpValue('finances') as [number,number])?.[0] || 0, Number(e.target.value)])} /></div>
                                </div>
                                 <div>
                                    <Label>XP Reputación (Min-Max)</Label>
                                    <div className="flex gap-2"><Input type="number" placeholder="Min" value={(getXpValue('reputation') as [number,number])?.[0] || ''} onChange={e => setXpValue('reputation', [Number(e.target.value), (getXpValue('reputation') as [number,number])?.[1] || 0])} /><Input type="number" placeholder="Max" value={(getXpValue('reputation') as [number,number])?.[1] || ''} onChange={e => setXpValue('reputation', [(getXpValue('reputation') as [number,number])?.[0] || 0, Number(e.target.value)])} /></div>
                                </div>
                                 <div>
                                    <Label>XP Moral (Min-Max)</Label>
                                    <div className="flex gap-2"><Input type="number" placeholder="Min" value={(getXpValue('morale') as [number,number])?.[0] || ''} onChange={e => setXpValue('morale', [Number(e.target.value), (getXpValue('morale') as [number,number])?.[1] || 0])} /><Input type="number" placeholder="Max" value={(getXpValue('morale') as [number,number])?.[1] || ''} onChange={e => setXpValue('morale', [(getXpValue('morale') as [number,number])?.[0] || 0, Number(e.target.value)])} /></div>
                                </div>
                           </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Inversión</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CatalogEditor({
  title,
  description,
  data,
  type,
}: CatalogEditorProps) {
  const [items, setItems] = useState(data);
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>(undefined);


  const openDetails = (item: CatalogItem) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };
  
  const openForm = (item?: Investment) => {
      setEditingInvestment(item);
      setFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setItems(items.filter(item => item.id !== itemId));
  };
  
  const handleSaveInvestment = (investment: Investment) => {
    setItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.id === investment.id);
        if (existingIndex > -1) {
            const newItems = [...prevItems];
            newItems[existingIndex] = investment;
            return newItems;
        }
        return [...prevItems, investment];
    });
    setFormOpen(false);
  };

  const isCrisis = (item: CatalogItem): item is Crisis => {
    return 'options' in item;
  }
  
  const isInvestment = (item: CatalogItem): item is Investment => {
    return 'xpBonus' in item;
  }

  const formatCost = (cost: Investment['cost']) => {
    if (cost.type === 'fixed') {
      return `${(cost.value as number).toLocaleString('es-ES')} CC`;
    }
    const [min, max] = cost.value as [number, number];
    return `${min.toLocaleString('es-ES')} - ${max.toLocaleString('es-ES')} CC`;
  };

  const formatArea = (xpBonus: Investment['xpBonus']) => {
    const areas = [];
    if (xpBonus.finances) areas.push('Finanzas');
    if (xpBonus.reputation) areas.push('Reputación');
    if (xpBonus.morale) areas.push('Moral');
    
    if (areas.length > 1) {
        return 'Varias';
    }
    if (areas.length === 1) {
        return areas[0];
    }
    
    return 'N/A';
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {type === 'investment' && (
                <Button onClick={() => openForm(undefined)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Nuevo
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                {type === "investment" && (
                  <>
                    <TableHead>Área(s)</TableHead>
                    <TableHead>Coste</TableHead>
                  </>
                )}
                <TableHead className="w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} onClick={() => openDetails(item)} className="cursor-pointer">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-sm truncate">
                    {item.description}
                  </TableCell>
                  {type === "investment" && isInvestment(item) && (
                     <>
                        <TableCell>
                            <Badge variant="outline">{formatArea(item.xpBonus)}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                            {formatCost(item.cost)}
                        </TableCell>
                     </>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetails(item); }}>
                           <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                         </DropdownMenuItem>
                         {isInvestment(item) && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openForm(item); }}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                         )}
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, item.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Borrar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {type === 'investment' && (
          <InvestmentForm 
            isOpen={isFormOpen}
            onOpenChange={setFormOpen}
            initialData={editingInvestment}
            onSave={handleSaveInvestment}
          />
      )}
      
      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  {selectedItem.description}
                </DialogDescription>
              </DialogHeader>
              
              {isInvestment(selectedItem) && (
                <div className="space-y-4 py-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium">Coste (CC)</p>
                        <p className="text-sm text-muted-foreground mt-1">{formatCost(selectedItem.cost)}</p>
                      </div>
                       <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium">Bonus de XP</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tipo: <span className="capitalize">{selectedItem.xpBonus.type}</span>
                        </p>
                      </div>
                   </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">Efectos Directos en KPIs</p>
                    <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                        {selectedItem.effects.nma ? <li>NMA: +{selectedItem.effects.nma}</li> : null}
                        {selectedItem.effects.morale ? <li>Moral: +{selectedItem.effects.morale}</li> : null}
                        {selectedItem.effects.iam ? <li>IAM: +{selectedItem.effects.iam}</li> : null}
                        {selectedItem.effects.personnelCostReduction ? <li>Reducción Coste Personal: -{(selectedItem.effects.personnelCostReduction * 100).toFixed(0)}%</li> : null}
                        {selectedItem.effects.cashInjection ? <li>Inyección de Tesorería: +{selectedItem.effects.cashInjection.toLocaleString('es-ES')} CC</li> : null}
                        {selectedItem.effects.reputationPenalty ? <li>Penalización Reputación: {selectedItem.effects.reputationPenalty} XP</li> : null}
                        {Object.values(selectedItem.effects).every(v => v === undefined || v === 0) && <li className="list-none">Sin efectos directos.</li>}
                    </ul>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">Valores de Bonus de XP</p>
                     <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                        {selectedItem.xpBonus.finances ? <li>Finanzas: {Array.isArray(selectedItem.xpBonus.finances) ? `de ${selectedItem.xpBonus.finances[0]} a ${selectedItem.xpBonus.finances[1]}` : selectedItem.xpBonus.finances} XP</li> : null}
                        {selectedItem.xpBonus.reputation ? <li>Reputación: {Array.isArray(selectedItem.xpBonus.reputation) ? `de ${selectedItem.xpBonus.reputation[0]} a ${selectedItem.xpBonus.reputation[1]}` : selectedItem.xpBonus.reputation} XP</li> : null}
                        {selectedItem.xpBonus.morale ? <li>Moral: {Array.isArray(selectedItem.xpBonus.morale) ? `de ${selectedItem.xpBonus.morale[0]} a ${selectedItem.xpBonus.morale[1]}` : selectedItem.xpBonus.morale} XP</li> : null}
                        {!selectedItem.xpBonus.finances && !selectedItem.xpBonus.reputation && !selectedItem.xpBonus.morale && <li className="list-none">Sin bonus de XP.</li>}
                     </ul>
                  </div>

                </div>
              )}

              {isCrisis(selectedItem) && (
                <div className="space-y-4 py-4">
                  <h4 className="font-semibold">Opciones de Respuesta:</h4>
                  <div className="space-y-3">
                    {selectedItem.options.map((option, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-md">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{index + 1}. {option.label}</p>
                          <p className="font-mono text-sm">{option.costText}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{option.effect}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
               <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
