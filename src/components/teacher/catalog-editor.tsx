
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import { Checkbox } from "../ui/checkbox";

export type Investment = {
  id: string;
  name: string;
  description: string;
  costRange: string;
  effect: string;
};

type CrisisOption = {
  label: string;
  effect: string;
};

export type Crisis = {
  id: string;
  name: string;
  description: string;
  options: CrisisOption[];
  cost?: never; // Ensure crisis doesn't have a cost property
};

type CatalogItem = Investment | Crisis;

interface CatalogEditorProps {
  title: string;
  description: string;
  data: CatalogItem[];
  type: "investment" | "crisis";
  isGameCatalog?: boolean;
  fullCatalog?: CatalogItem[];
}

export function CatalogEditor({
  title,
  description,
  data,
  type,
  isGameCatalog = false,
  fullCatalog = []
}: CatalogEditorProps) {
  const [items, setItems] = useState(data);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const handleRowClick = (item: CatalogItem) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const isCrisis = (item: CatalogItem): item is Crisis => {
    return 'options' in item;
  }
  
  const isInvestment = (item: CatalogItem): item is Investment => {
    return 'costRange' in item;
  }

  const AddFromCatalogDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir {type === 'crisis' ? 'Crisis' : 'Inversiones'} desde el Catálogo</DialogTitle>
          <DialogDescription>
            Selecciona los elementos que quieres añadir a esta partida.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-4 p-4">
            {fullCatalog.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox id={`cat-${item.id}`} className="mt-1"/>
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`cat-${item.id}`} className="font-medium cursor-pointer">
                    {item.name}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => setAddDialogOpen(false)}>Añadir Seleccionados</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const AddNewDialog = () => (
     <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Evento de {type === 'crisis' ? 'Crisis' : 'Inversión'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descripción</Label>
              <Textarea id="description" className="col-span-3" />
            </div>
            {/* Form fields for options/effects would go here */}
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
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
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                {type === "investment" && (
                  <TableHead>Coste (CC)</TableHead>
                )}
                <TableHead className="w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description}
                  </TableCell>
                  {type === "investment" && isInvestment(item) && 'cost' in item && (
                    <TableCell className="text-right font-mono">
                      {(item as any).cost.toLocaleString()}
                    </TableCell>
                  )}
                  {type === "investment" && isInvestment(item) && !('cost' in item) && (
                     <TableCell className="text-right font-mono">
                      {item.costRange}
                    </TableCell>
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
                         <DropdownMenuItem onClick={() => handleRowClick(item)}>
                           <Eye className="mr-2 h-4 w-4" /> Ver
                         </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
      
      {isGameCatalog ? <AddFromCatalogDialog /> : <AddNewDialog />}
      
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
                   { 'cost' in selectedItem &&
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="font-medium">Coste (CC)</p>
                      <p className="text-sm text-muted-foreground mt-1">{(selectedItem as any).cost.toLocaleString()}</p>
                    </div>
                  }
                  { 'costRange' in selectedItem &&
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="font-medium">Rango de Coste (CC)</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedItem.costRange}</p>
                    </div>
                  }
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="font-medium">Efecto en XP / Moral</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedItem.effect}</p>
                  </div>
                </div>
              )}

              {isCrisis(selectedItem) && (
                <div className="space-y-4 py-4">
                  <h4 className="font-semibold">Opciones de Respuesta:</h4>
                  <div className="space-y-3">
                    {selectedItem.options.map((option, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium">{index + 1}. {option.label}</p>
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
