
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  gameName: z.string().min(1, "El nombre del juego es requerido."),
  numRounds: z.number().min(1).max(20),
  numTeams: z.number().min(1).max(10),
  initialFunds: z.number().min(1000),
  newStudentsPerRound: z.number().min(0),
  aiDifficulty: z.number().min(1).max(5),
});

export type GameConfig = z.infer<typeof formSchema>;

interface GameConfigFormProps {
  onCreateGame: (data: GameConfig) => void;
}

export function GameConfigForm({ onCreateGame }: GameConfigFormProps) {
  const form = useForm<GameConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameName: "",
      numRounds: 8,
      numTeams: 4,
      initialFunds: 50000,
      newStudentsPerRound: 50,
      aiDifficulty: 3,
    },
  });

  function onSubmit(values: GameConfig) {
    onCreateGame(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="gameName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Juego</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Simulación de Marketing Digital"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="numRounds"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Número de Rondas ({field.value})</FormLabel>
                <FormControl>
                    <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    />
                </FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="numTeams"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nº Equipos Humanos ({field.value})</FormLabel>
                <FormControl>
                    <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    />
                </FormControl>
                </FormItem>
            )}
            />
        </div>
           
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="initialFunds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fondos Iniciales</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newStudentsPerRound"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alumnos nuevos / ronda</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="aiDifficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dificultad de Rivales AI ({field.value})</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Crear Juego
        </Button>
      </form>
    </Form>
  );
}
