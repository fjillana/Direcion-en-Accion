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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { AIReport } from "@/components/teacher/ai-report";
import { CatalogEditor } from "@/components/teacher/catalog-editor";
import { Badge } from "@/components/ui/badge";

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const teams = [
    {
      name: "Equipo Alfa",
      peb: 95,
      xp: 1200,
      grade: 8.5,
      price: 102,
      marketing: 5000,
    },
    {
      name: "Equipo Beta",
      peb: 105,
      xp: 1500,
      grade: 9.2,
      price: 98,
      marketing: 6000,
    },
    {
      name: "Equipo Gamma",
      peb: 88,
      xp: 950,
      grade: 7.8,
      price: 110,
      marketing: 4000,
    },
    {
      name: "Equipo Delta",
      peb: 110,
      xp: 1800,
      grade: 9.8,
      price: 95,
      marketing: 7500,
    },
  ];

  const investments = [
    {
      id: "inv1",
      name: "Mejora de maquinaria",
      cost: 15000,
      description: "Aumenta la eficiencia de producción.",
    },
    {
      id: "inv2",
      name: "Campaña de marketing digital",
      cost: 8000,
      description: "Mejora la reputación de la marca.",
    },
  ];
  const crises = [
    {
      id: "crisis1",
      name: "Huelga de trabajadores",
      description: "Los trabajadores exigen mejores condiciones laborales.",
    },
    {
      id: "crisis2",
      name: "Fallo en la cadena de suministro",
      description: "Un proveedor clave ha quebrado.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Simulación de Negocios 101
          </h1>
          <p className="text-muted-foreground">
            Ronda 3 - Juego ID: {params.id}
          </p>
        </div>
        <Button size="lg">
          <PlayCircle className="mr-2 h-5 w-5" />
          Procesar Ronda
        </Button>
      </div>

      <Tabs defaultValue="monitoring">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Monitorización</TabsTrigger>
          <TabsTrigger value="reports">Reportes AI</TabsTrigger>
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="crises">Crisis</TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Equipos</CardTitle>
              <CardDescription>
                Vista general del rendimiento de cada equipo en la ronda actual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-right">PEB (%)</TableHead>
                    <TableHead className="text-right">XP</TableHead>
                    <TableHead className="text-right">Nota Media</TableHead>
                    <TableHead className="text-right">Precio Relativo</TableHead>
                    <TableHead className="text-right">Inv. Marketing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.name}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="text-right">
                        {team.peb}%{" "}
                        {team.peb > 100 && (
                          <Badge variant="destructive">Sobrecarga</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{team.xp}</TableCell>
                      <TableCell className="text-right">{team.grade}</TableCell>
                      <TableCell className="text-right">
                        ${team.price}
                      </TableCell>
                      <TableCell className="text-right">
                        ${team.marketing.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <AIReport />
        </TabsContent>
        <TabsContent value="investments">
          <CatalogEditor
            title="Inversiones"
            description="Gestiona las inversiones disponibles para los estudiantes."
            data={investments}
            type="investment"
          />
        </TabsContent>
        <TabsContent value="crises">
          <CatalogEditor
            title="Crisis"
            description="Gestiona los eventos de crisis que pueden ocurrir."
            data={crises}
            type="crisis"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
