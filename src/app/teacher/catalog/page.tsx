import { CatalogEditor } from "@/components/teacher/catalog-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CatalogPage() {
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
    {
      id: "inv3",
      name: "Formación avanzada de personal",
      cost: 10000,
      description: "Aumenta la productividad y reduce errores.",
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
    {
      id: "crisis3",
      name: "Campaña de desprestigio en redes sociales",
      description: "Rumores falsos afectan la imagen de la marca.",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">
        Gestión de Catálogos
      </h1>
      <Tabs defaultValue="investments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="crises">Crisis</TabsTrigger>
        </TabsList>
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
