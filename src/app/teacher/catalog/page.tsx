import { CatalogEditor } from "@/components/teacher/catalog-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { investments } from "./investment-data";
import { crises } from "./crises-data";

export default function CatalogPage() {

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

    