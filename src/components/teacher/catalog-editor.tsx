

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
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "@/components/ui/badge";


// NEW, DETAILED INVESTMENT TYPE
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
    area: 'finances' | 'reputation' | 'morale';
    type: 'fixed' | 'scaled';
    value: number | [number, number];
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
    xpBonus: { area: 'finances', type: 'fixed', value: 0 }
};


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
  const [editingInvestment, setEditingInvestment] = useState<Investment>(emptyInvestment);


  const openDetails = (item: CatalogItem) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };
  
  const openForm = (item?: Investment) => {
      setEditingInvestment(item ? JSON.parse(JSON.stringify(item)) : { ...emptyInvestment, id: `inv_${Date.now()}` });
      setFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setItems(items.filter(item => item.id !== itemId));
  };
  
  const handleSaveInvestment = () => {
    setItems(prevItems => {
        const existing = prevItems.find(item => item.id === editingInvestment.id);
        if (existing) {
            return prevItems.map(item => item.id === editingInvestment.id ? editingInvestment : item);
        }
        return [...prevItems, editingInvestment];
    });
    setFormOpen(false);
  };

  const handleInvestmentFormChange = (field: string, value: any) => {
    setEditingInvestment(prev => {
        const keys = field.split('.');
        if (keys.length === 1) {
            return { ...prev, [field]: value };
        } else {
            // Deep copy to avoid mutation issues
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            // Handle specific logic, e.g., if cost type changes
            if(field === 'cost.type') {
                newState.cost.value = value === 'fixed' ? 0 : [0, 0];
            }
            if(field === 'xpBonus.type') {
                newState.xpBonus.value = value === 'fixed' ? 0 : [0, 0];
            }
            return newState;
        }
    });
  };


  const isCrisis = (item: CatalogItem): item is Crisis => {
    return 'options' in item;
  }
  
  const isInvestment = (item: CatalogItem): item is Investment => {
    return 'cost' in item && 'xpBonus' in item;
  }

  const formatCost = (cost: Investment['cost']) => {
    if (cost.type === 'fixed') {
      return `${(cost.value as number).toLocaleString('es-ES')} CC`;
    }
    const [min, max] = cost.value as [number, number];
    return `${min.toLocaleString('es-ES')} - ${max.toLocaleString('es-ES')} CC`;
  };

  const formatArea = (area: 'finances' | 'reputation' | 'morale') => {
    switch (area) {
      case 'finances': return 'Finanzas';
      case 'reputation': return 'Reputación';
      case 'morale': return 'Moral';
      default: return area;
    }
  }

  const InvestmentForm = () => (
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                  <DialogTitle>{editingInvestment.name ? `Editar Inversión: ${editingInvestment.name}` : "Añadir Nueva Inversión"}</DialogTitle>
                  <DialogDescription>Define todos los parámetros y efectos de esta inversión en la simulación.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                  {/* Columna Izquierda */}
                  <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Información Básica</h3>
                      <div>
                          <Label htmlFor="inv-name">Nombre</Label>
                          <Input id="inv-name" value={editingInvestment.name} onChange={e => handleInvestmentFormChange('name', e.target.value)} />
                      </div>
                      <div>
                          <Label htmlFor="inv-desc">Descripción</Label>
                          <Textarea id="inv-desc" value={editingInvestment.description} onChange={e => handleInvestmentFormChange('description', e.target.value)} />
                      </div>

                      <h3 className="font-semibold text-lg border-b pb-2 mt-4">Coste</h3>
                      <div className="space-y-2">
                         <Label>Tipo de Coste</Label>
                         <Select value={editingInvestment.cost.type} onValueChange={value => handleInvestmentFormChange('cost.type', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fijo</SelectItem>
                                <SelectItem value="range">Rango</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      {editingInvestment.cost.type === 'fixed' ? (
                          <div>
                              <Label htmlFor="cost-fixed">Coste Fijo (CC)</Label>
                              <Input id="cost-fixed" type="number" value={editingInvestment.cost.value as number} onChange={e => handleInvestmentFormChange('cost.value', Number(e.target.value))} />
                          </div>
                      ) : (
                          <div className="flex gap-4">
                              <div>
                                  <Label htmlFor="cost-range-min">Mínimo</Label>
                                  <Input id="cost-range-min" type="number" value={(editingInvestment.cost.value as [number, number])[0]} onChange={e => handleInvestmentFormChange('cost.value', [Number(e.target.value), (editingInvestment.cost.value as [number, number])[1]])} />
                              </div>
                               <div>
                                  <Label htmlFor="cost-range-max">Máximo</Label>
                                  <Input id="cost-range-max" type="number" value={(editingInvestment.cost.value as [number, number])[1]} onChange={e => handleInvestmentFormChange('cost.value', [(editingInvestment.cost.value as [number, number])[0], Number(e.target.value)])} />
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
                              <Input id="effect-nma" type="number" step="0.1" value={editingInvestment.effects.nma || 0} onChange={e => handleInvestmentFormChange('effects.nma', Number(e.target.value))} />
                           </div>
                            <div>
                              <Label htmlFor="effect-morale">Bonus Moral</Label>
                              <Input id="effect-morale" type="number" step="1" value={editingInvestment.effects.morale || 0} onChange={e => handleInvestmentFormChange('effects.morale', Number(e.target.value))} />
                           </div>
                           <div>
                              <Label htmlFor="effect-iam">Bonus IAM</Label>
                              <Input id="effect-iam" type="number" step="1" value={editingInvestment.effects.iam || 0} onChange={e => handleInvestmentFormChange('effects.iam', Number(e.target.value))} />
                           </div>
                           <div>
                              <Label htmlFor="effect-cost-reduc">Reducción Coste Personal (%)</Label>
                              <Input id="effect-cost-reduc" type="number" step="0.01" value={(editingInvestment.effects.personnelCostReduction || 0) * 100} onChange={e => handleInvestmentFormChange('effects.personnelCostReduction', Number(e.target.value) / 100)} />
                           </div>
                       </div>
                      <h3 className="font-semibold text-lg border-b pb-2 mt-4">Bonus de XP</h3>
                      <div className="space-y-2">
                        <Label>Área del Bonus</Label>
                        <Select value={editingInvestment.xpBonus.area} onValueChange={value => handleInvestmentFormChange('xpBonus.area', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="finances">Finanzas</SelectItem>
                                <SelectItem value="reputation">Reputación</SelectItem>
                                <SelectItem value="morale">Moral</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label>Tipo de Bonus</Label>
                        <Select value={editingInvestment.xpBonus.type} onValueChange={value => handleInvestmentFormChange('xpBonus.type', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fijo</SelectItem>
                                <SelectItem value="scaled">Escalonado (por coste)</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      {editingInvestment.xpBonus.type === 'fixed' ? (
                          <div>
                              <Label htmlFor="xp-fixed">XP Fijo</Label>
                              <Input id="xp-fixed" type="number" value={editingInvestment.xpBonus.value as number} onChange={e => handleInvestmentFormChange('xpBonus.value', Number(e.target.value))} />
                          </div>
                      ) : (
                          <div className="flex gap-4">
                              <div>
                                  <Label htmlFor="xp-range-min">Mínimo</Label>
                                  <Input id="xp-range-min" type="number" value={(editingInvestment.xpBonus.value as [number, number])[0]} onChange={e => handleInvestmentFormChange('xpBonus.value', [Number(e.target.value), (editingInvestment.xpBonus.value as [number, number])[1]])} />
                              </div>
                               <div>
                                  <Label htmlFor="xp-range-max">Máximo</Label>
                                  <Input id="xp-range-max" type="number" value={(editingInvestment.xpBonus.value as [number, number])[1]} onChange={e => handleInvestmentFormChange('xpBonus.value', [(editingInvestment.xpBonus.value as [number, number])[0], Number(e.target.value)])} />
                              </div>
                          </div>
                      )}
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveInvestment}>Guardar Inversión</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
  );


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
                <Button onClick={() => openForm()}>
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
                    <TableHead>Área</TableHead>
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
                            <Badge variant="outline">{formatArea(item.xpBonus.area)}</Badge>
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
      
      {type === 'investment' && <InvestmentForm />}
      
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
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">Coste (CC)</p>
                    <p className="text-sm text-muted-foreground mt-1">{formatCost(selectedItem.cost)}</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">Bonus de XP</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Área: <span className="capitalize">{selectedItem.xpBonus.area}</span>,
                      Tipo: <span className="capitalize">{selectedItem.xpBonus.type}</span>,
                      Valor: {Array.isArray(selectedItem.xpBonus.value) ? `${selectedItem.xpBonus.value[0]} a ${selectedItem.xpBonus.value[1]}` : selectedItem.xpBonus.value} XP
                    </p>
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
