
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
  initialFunds: z.number().min(1000),
  newStudentsPerRound: z.number().min(0),
  aiDifficulty: z.number().min(1).max(5),
  publicLeaderboard: z.boolean(),
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
      initialFunds: 50000,
      newStudentsPerRound: 50,
      aiDifficulty: 3,
      publicLeaderboard: true,
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
                      field.onChange(parseInt(e.target.value, 10))
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
                      field.onChange(parseInt(e.target.value, 10))
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
        <FormField
          control={form.control}
          name="publicLeaderboard"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Leaderboard Público</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
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
